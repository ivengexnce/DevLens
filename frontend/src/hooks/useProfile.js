import { useState, useCallback } from 'react';
import { githubApi, aiApi } from '../utils/api';

export function useProfile() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null, // { user, repos, analytics, orgs }
    aiInsight: null,
    aiLoading: false,
    aiType: 'profile',
  });

  const fetchProfile = useCallback(async (username) => {
    if (!username?.trim()) return;
    setState((s) => ({ ...s, loading: true, error: null, data: null, aiInsight: null }));

    try {
      const { data } = await githubApi.getProfile(username.trim());
      setState((s) => ({ ...s, loading: false, data }));

      // Fire AI insight async
      setState((s) => ({ ...s, aiLoading: true }));
      try {
        const { data: ai } = await aiApi.insight({
          user: data.user,
          analytics: data.analytics,
          type: 'profile',
        });
        setState((s) => ({ ...s, aiInsight: ai.insight, aiLoading: false }));
      } catch {
        setState((s) => ({ ...s, aiLoading: false }));
      }
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  const fetchRoast = useCallback(async () => {
    if (!state.data) return;
    setState((s) => ({ ...s, aiLoading: true, aiType: 'roast' }));
    try {
      const { data } = await aiApi.roast({ user: state.data.user, analytics: state.data.analytics });
      setState((s) => ({ ...s, aiInsight: data.insight, aiLoading: false }));
    } catch {
      setState((s) => ({ ...s, aiLoading: false }));
    }
  }, [state.data]);

  const fetchCareerInsight = useCallback(async () => {
    if (!state.data) return;
    setState((s) => ({ ...s, aiLoading: true, aiType: 'career' }));
    try {
      const { data } = await aiApi.insight({
        user: state.data.user,
        analytics: state.data.analytics,
        type: 'career',
      });
      setState((s) => ({ ...s, aiInsight: data.insight, aiLoading: false }));
    } catch {
      setState((s) => ({ ...s, aiLoading: false }));
    }
  }, [state.data]);

  return { ...state, fetchProfile, fetchRoast, fetchCareerInsight };
}
