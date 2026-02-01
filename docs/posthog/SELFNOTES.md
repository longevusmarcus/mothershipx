## Questions that posthog can answer

┌─────────────────────────────────────────────────────────────────┬───────────────┬───────────────────────────────────────────────┐                                                                       
  │                            Question                             │   Supabase    │                    PostHog                    │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Where do users click on this page?"                            │ ❌            │ ✅ Heatmaps                                   │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Why did this user abandon checkout?"                           │ ❌            │ ✅ Session replay - watch their exact journey │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "What's the conversion funnel from landing → signup → payment?" │ Manual SQL    │ ✅ Visual funnel builder                      │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Which button variant gets more clicks?"                        │ ❌            │ ✅ A/B testing                                │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "How long do users spend on each page?"                         │ ❌            │ ✅ Time-on-page analytics                     │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "What path do users take through the app?"                      │ ❌            │ ✅ User path analysis                         │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Which features are actually used?"                             │ Manual events │ ✅ Autocapture + feature flags                │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Did this user rage-click or get frustrated?"                   │ ❌            │ ✅ Session replay detects rage clicks         │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "What's my retention curve?"                                    │ Complex SQL   │ ✅ Built-in retention charts                  │                                                                       
  ├─────────────────────────────────────────────────────────────────┼───────────────┼───────────────────────────────────────────────┤                                                                       
  │ "Which marketing channel brings paying users?"                  │ ❌            │ ✅ UTM tracking + attribution                 │                                                                       
  └─────────────────────────────────────────────────────────────────┴───────────────┴───────────────────────────────────────────────┘                                                                       
## Limitations

1. Session replay limits (expire after 30 days on free)
2. All clicks inputs saved. Can burn thru event quota fast. Need to configure allowlists
3. 1-5 mins delay
4. Need a cookie banner
5. Add 50kb bundle size


```ts
  Common Development Gotchas                                                                                                                                                                                
                                                                                                                                                                                                            
  1. Double-tracking in React Strict Mode                                                                                                                                                                   
                                                                                                                                                                                                            
  // ❌ BAD - tracks twice in dev due to StrictMode                                                                                                                                                         
  useEffect(() => {                                                                                                                                                                                         
    posthog.capture('page_view')                                                                                                                                                                            
  }, [])                                                                                                                                                                                                    
                                                                                                                                                                                                            
  // ✅ GOOD - use their React hooks                                                                                                                                                                        
  import { usePostHog } from 'posthog-js/react'                                                                                                                                                             
  const posthog = usePostHog()                                                                                                                                                                              
  posthog.capture('page_view')                                                                                                                                                                              
                                                                                                                                                                                                            
  2. Identifying Users Too Early                                                                                                                                                                            
                                                                                                                                                                                                            
  // ❌ BAD - calling identify before user exists                                                                                                                                                           
  posthog.identify(user?.id) // undefined on first render!                                                                                                                                                  
                                                                                                                                                                                                            
  // ✅ GOOD - only identify when user actually exists                                                                                                                                                      
  useEffect(() => {                                                                                                                                                                                         
    if (user?.id) {                                                                                                                                                                                         
      posthog.identify(user.id, {                                                                                                                                                                           
        email: user.email,                                                                                                                                                                                  
        plan: subscription?.plan                                                                                                                                                                            
      })                                                                                                                                                                                                    
    }                                                                                                                                                                                                       
  }, [user?.id])                                                                                                                                                                                            
                                                                                                                                                                                                            
  3. Not Resetting on Logout                                                                                                                                                                                
                                                                                                                                                                                                            
  // ❌ BAD - next user inherits previous user's session                                                                                                                                                    
  const logout = () => {                                                                                                                                                                                    
    supabase.auth.signOut()                                                                                                                                                                                 
  }                                                                                                                                                                                                         
                                                                                                                                                                                                            
  // ✅ GOOD - reset PostHog identity                                                                                                                                                                       
  const logout = () => {                                                                                                                                                                                    
    posthog.reset() // Clear identity                                                                                                                                                                       
    supabase.auth.signOut()                                                                                                                                                                                 
  }                                                                                                                                                                                                         
                                                                                                                                                                                                            
  4. Session Replay Capturing Sensitive Data                                                                                                                                                                
                                                                                                                                                                                                            
  // In posthog.init() - mask sensitive elements                                                                                                                                                            
  posthog.init('key', {                                                                                                                                                                                     
    session_recording: {                                                                                                                                                                                    
      maskAllInputs: true,           // Mask all input values                                                                                                                                               
      maskTextSelector: '.sensitive', // Mask elements with this class                                                                                                                                      
    }                                                                                                                                                                                                       
  })                                                                                                                                                                                                        
                                                                                                                                                                                                            
  5. Vite Environment Variables                                                                                                                                                                             
                                                                                                                                                                                                            
  // ❌ BAD - won't work in Vite                                                                                                                                                                            
  process.env.POSTHOG_KEY                                                                                                                                                                                   
                                                                                                                                                                                                            
  // ✅ GOOD - Vite uses import.meta.env                                                                                                                                                                    
  import.meta.env.VITE_POSTHOG_KEY                                                                                                                                                                          
                                                                                                                                                                                                            
  6. Blocking Autocapture on Sensitive Pages                                                                                                                                                                
                                                                                                                                                                                                            
  // Disable autocapture on checkout/payment pages                                                                                                                                                          
  posthog.init('key', {                                                                                                                                                                                     
    autocapture: {                                                                                                                                                                                          
      dom_event_allowlist: ['click'], // Only clicks, no inputs                                                                                                                                             
      url_ignorelist: ['/checkout', '/payment'],                                                                                                                                                            
    }                                                                                                                                                                                                       
  })                                                                                                                                                                                                        
                                                                                                                                                                                                            
  7. Feature Flags Not Ready on First Render                                                                                                                                                                
                                                                                                                                                                                                            
  // ❌ BAD - flags might not be loaded yet                                                                                                                                                                 
  if (posthog.isFeatureEnabled('new-feature')) { ... }                                                                                                                                                      
                                                                                                                                                                                                            
  // ✅ GOOD - wait for flags to load                                                                                                                                                                       
  const [flagsReady, setFlagsReady] = useState(false)                                                                                                                                                       
  useEffect(() => {                                                                                                                                                                                         
    posthog.onFeatureFlags(() => setFlagsReady(true))                                                                                                                                                       
  }, [])
```