import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Router } from '@angular/router';

@Service()
export class AuthService {
    supabase = inject(SupabaseService).client;
    private router = inject(Router);
    isLoggedIn = signal<boolean>(false);
    // currentUserId wird benötigt, um den user in die contact list zu übertragen
    // Anlegen vom foreign key in supabase noch notwendig
    currentUserId = signal<string | null>(null);
    loginError = signal<string | null>(null);

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
            console.log('Successfully signed up', data);
            this.router.navigate(['/summary']);
        }
    };

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
            this.loginError.set('user could not be found')
        } else {
            console.log('Successfully logged in', data);
            this.loginError.set(null);
            this.router.navigate(['/summary']);
        }
    };

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error(error);
        } else {
            this.router.navigate([''])
        }
    };

    async signInAsGuest() {
        this.loginError.set(null);
        const { data, error } = await this.supabase.auth.signInAnonymously();
        if (error) {
            console.log(error);
            this.loginError.set('guest login failed');
        } else {
            console.log('Successfully signed in as guest', data);
            this.loginError.set(null);
            this.router.navigate(['/summary']);
        }
    };
}
