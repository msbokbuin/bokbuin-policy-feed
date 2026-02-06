'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AccessState = {
  loading: boolean;
  user: any | null;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  email?: string | null;
  error?: string | null;
};

export function useUserAccess(): AccessState {
  const [state, setState] = useState<AccessState>({
    loading: true,
    user: null,
    isLoggedIn: false,
    isSubscriber: false,
    email: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const user = authData?.user ?? null;
        if (!user) {
          if (!mounted) return;
          setState({
            loading: false,
            user: null,
            isLoggedIn: false,
            isSubscriber: false,
            email: null,
            error: null,
          });
          return;
        }

        // profiles에서 구독 여부 조회
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_subscriber, email')
          .eq('id', user.id)
          .maybeSingle();

        // profiles row가 아직 없으면 생성 (최초 로그인 시)
        if (profileError) throw profileError;

        if (!profile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email ?? null,
            is_subscriber: false,
          });
          if (insertError) throw insertError;

          if (!mounted) return;
          setState({
            loading: false,
            user,
            isLoggedIn: true,
            isSubscriber: false,
            email: user.email ?? null,
            error: null,
          });
          return;
        }

        if (!mounted) return;
        setState({
          loading: false,
          user,
          isLoggedIn: true,
          isSubscriber: !!profile.is_subscriber,
          email: profile.email ?? user.email ?? null,
          error: null,
        });
      } catch (err: any) {
        if (!mounted) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err?.message ?? 'Unknown error',
        }));
      }
    };

    run();

    // 로그인/로그아웃 즉시 반영
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      run();
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return state;
}
