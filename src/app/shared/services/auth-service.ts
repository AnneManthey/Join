import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Service()
export class AuthService {
    supabase = inject(SupabaseService).client;

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
}
}
