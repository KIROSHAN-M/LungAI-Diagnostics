import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Stethoscope, Activity, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageOverlayAnimation from "@/components/PageOverlayAnimation";
import { playClick, playType, playSuccess, playError, playNavigate } from "@/hooks/useSoundEffects";
import bgLogin from "@/assets/bg-login.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already authenticated (e.g. after email verification)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        playSuccess();
        navigate("/patient-info");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!email || !password) {
      playError();
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        playSuccess();
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        playSuccess();
        playNavigate();
        navigate("/patient-info");
      }
    } catch (error: any) {
      playError();
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    playClick();
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) { playError(); toast.error("Google sign-in failed"); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={bgLogin} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      <PageOverlayAnimation page="login" />

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 z-10" style={{ backgroundImage: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-white space-y-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Stethoscope className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LungAI Diagnostics</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            AI-Powered<br />Lung Disease<br />Detection
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Advanced deep learning analysis for Pneumonia, Tuberculosis, COVID-19, Asthma, and Lung Cancer detection from chest X-rays.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Activity className="w-4 h-4" /> <span>High Accuracy</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Shield className="w-4 h-4" /> <span>HIPAA Ready</span>
            </div>
          </div>

          {/* Floating medical icons */}
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Stethoscope className="w-40 h-40 animate-float" />
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <div className="w-full max-w-md space-y-8 bg-card/90 backdrop-blur-md rounded-3xl p-8 border border-border shadow-xl animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3 lg:hidden">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">LungAI Diagnostics</span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? "Sign up to start using diagnostics" : "Sign in to the diagnostic portal"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); playType(); }}
                  className="pl-10 h-12 bg-background border-border rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); playType(); }}
                  className="pl-10 pr-10 h-12 bg-background border-border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => { setShowPassword(!showPassword); playClick(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold rounded-xl transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or continue with</span></div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-medium bg-background rounded-xl transition-transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); playClick(); }} className="text-primary font-bold hover:underline">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            LungAI Deep Learning Diagnostic System v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
