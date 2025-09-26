import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TriggerSignIn = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/signin");
  }, [router]);

  return null;
};

export default TriggerSignIn;
