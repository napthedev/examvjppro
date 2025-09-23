import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

const TriggerSignIn = () => {
  const { redirectToSignIn } = useClerk();

  useEffect(() => {
    redirectToSignIn();
  }, [redirectToSignIn]);

  return null;
};

export default TriggerSignIn;
