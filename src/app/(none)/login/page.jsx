import Intro from "@/components/intro";
import LoginForm from "@/components/loginForm";

export default function loginPage() {
  return (
    <>
      <Intro />
      <main className='login'>
        <LoginForm />
      </main>
    </>
  );
}
