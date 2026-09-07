import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Service()
export class AuthService {
    supabase = inject(SupabaseService).client;
    isLoggedIn = signal<boolean>(false);
    currentUserId = signal<string | null>(null);

    constructor() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.isLoggedIn.set(session !== null);
            this.currentUserId.set(session?.user.id ?? null);
        });
    }

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
            console.log(data);
        }
    };

    async signInWithEmail(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            console.log(error);
        } else {
            console.log('Successfully logged in', data);
        }
    }
}
