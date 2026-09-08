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

    // currentUserId wird benötigt, um den user in die contact list zu übertragen
    // Anlegen vom foreign key in supabase noch notwendig
    /** Stores the ID of the currently authenticated user. */
    currentUserId = signal<string | null>(null);

    /** Stores the latest authentication error shown to the user. */
    loginError = signal<string | null>(null);

    /** Controls the success message shown after a successful login. */
    showLoginSuccessMessage = signal(false);

    /** Starts listening for Supabase authentication state changes. */
    initAuthListener(): Promise<void> {
        return new Promise((resolve) => {
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.isLoggedIn.set(session !== null);

                // currentUserId wird benötigt, um den user in die contact list zu übertragen
                // Anlegen vom foreign key in supabase noch notwendig
                this.currentUserId.set(session?.user.id ?? null);

                resolve();
            });
        });
    };

    /** Registers a new user with the provided email address and password. */
    async signUpNewUser(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signUp({
            email: email,
            password: password,
            // options: {
            //     emailRedirectTo: 'https://example.com/welcome',
            // },
        })
        if (error) {
            console.log(error);
        } else {
            this.showLoginSuccessMessage.set(true);
            setTimeout(() => {
                this.showLoginSuccessMessage.set(false);
                this.router.navigate(['/summary'], { state: { fromLogin: true } });
            }, 1000)
        }
    };

    /** Signs in a user with an email address and password. */
    async signInWithEmail(email: string, password: string) {
        // loginerror wird hier auf null gesetzt, wenn man mehrmals falsch eingegeben hat, 
        // damit klar wird, dass der login nochmal probiert wird, 
        // denn die errormeldung verschwindet hierdurch
        this.loginError.set(null);
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            console.log(error);
            this.loginError.set('Check your email and password. Please try again.')
        } else {
            this.loginError.set(null);
            this.router.navigate(['/summary'], { state: { fromLogin: true } });
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
            console.log('Successfully signed in as guest', data);
            this.loginError.set(null);
            this.router.navigate(['/summary'], { state: { fromLogin: true } });
        }
    };
}
