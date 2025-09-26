import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { ResendOTP } from "./otp/ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, ResendOTP],
});
