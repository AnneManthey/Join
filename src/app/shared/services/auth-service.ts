import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Router } from '@angular/router';

@Service()
/** Provides authentication operations and exposes the current authentication state. */
export class AuthService {
    /** Supabase client used for authentication requests. */
    supabase = inject(SupabaseService).client;

    /** Router used to navigate after authentication state changes. */
    private router = inject(Router);

    /** Indicates whether a user is currently authenticated. */
    isLoggedIn = signal<boolean>(false);

    /** Stores the ID of the currently authenticated user. */
    currentUserId = signal<string | null>(null);

    /** Stores the display name of the currently authenticated user. */
    currentUserName = signal<string | null>(null);

    /** Indicates whether the currently authenticated user is an anonymous guest. */
    isGuest = signal<boolean>(false);

    /** Stores the latest authentication error shown to the user. */
    loginError = signal<string | null>(null);

    /** Stores the latest authentication error shown to the user. */
    registerError = signal<string | null>(null);

    /** Controls the success message shown after a successful login. */
    showLoginSuccessMessage = signal(false);

    /** Holds the Supabase auth state subscription so it can be cleaned up later. */
    private authSubscription: { unsubscribe: () => void } | null = null;

    /** Starts listening for Supabase authentication state changes. */
    initAuthListener(): Promise<void> {
        return new Promise((resolve) => {
            const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
                this.isLoggedIn.set(session !== null);
                this.currentUserId.set(session?.user.id ?? null);
                this.currentUserName.set(session?.user.user_metadata?.['display_name'] ?? null);
                this.isGuest.set(session?.user.is_anonymous ?? false);
                resolve();
            });
            this.authSubscription = data.subscription;
        });
    };

    /** Unsubscribes from the Supabase auth listener when the service is destroyed. */
    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    /** Registers a new user with the provided email address and password. */
    async signUpNewUser(name: string, email: string, password: string) {
        this.registerError.set(null);
        const userId = await this.registerUser(name, email, password);
        if (!userId) {
            return;
        }

        const contactCreated = await this.createContact(name, email, userId);
        if (!contactCreated) {
            return;
        }

        await this.completeSignup();
    };

    /** Registers the user in Supabase and returns the new user's ID. */
    private async registerUser(name: string, email: string, password: string): Promise<string | null> {
        const { data, error } = await this.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: name,
                },
            },
        })
        if (error) {
            if (error.message.includes('already registered') || error.code === 'user_already_exists') {
                this.registerError.set('This email is already registered.');
            } else {
                this.registerError.set('Registration failed. Please try again.');
            }
            return null;
        }

        return data.user?.id ?? null;
    }

    /** Creates a contact entry for the newly registered user. */
    private async createContact(name: string, email: string, userId: string): Promise<boolean> {
        const { error: contactError } = await this.supabase
            .from('ContactList')
            .insert({
                contact_name: name,
                contact_mail: email,
                user_id: userId,
            });

        if (contactError) {
            return false;
        }
        return true;
    }

    /** Signs the user out and redirects to the login page after a successful signup. */
    private async completeSignup(): Promise<void> {
        await this.supabase.auth.signOut();
        this.showLoginSuccessMessage.set(true);
        setTimeout(() => {
            this.showLoginSuccessMessage.set(false);
            this.router.navigate(['']);
        }, 1000)
    }

    /** Signs in a user with an email address and password. */
    async signInWithEmail(email: string, password: string): Promise<boolean> {
        this.loginError.set(null);
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            console.log(error);
            this.loginError.set('Check your email and password. Please try again.');
            return false;
        } else {
            this.loginError.set(null);
            this.router.navigate(['/summary'], { state: { fromLogin: true } });
            return true;
        }
    };

    /** Signs out the current user and returns to the login page. */
    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error(error);
        } else {
            this.router.navigate([''])
        }
    };

    /** Signs in anonymously as a guest user. */
    async signInAsGuest() {
        this.loginError.set(null);
        const { data, error } = await this.supabase.auth.signInAnonymously();
        if (error) {
            console.log(error);
            this.loginError.set('guest login failed');
        } else {
            this.loginError.set(null);
            this.router.navigate(['/summary'], { state: { fromLogin: true } });
        }
    };
}
