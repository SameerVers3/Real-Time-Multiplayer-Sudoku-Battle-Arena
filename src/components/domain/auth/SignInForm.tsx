import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "~/lib/firebase";
import { useState } from "react";

type AuthForm = {
  email: string;
  password: string;
};

export const SignInForm = () => {
  const [authForm, setAuthForm] = useState<AuthForm>({ email: '', password: '' });
  const  auth  = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    if (authForm.email == "" || authForm.password == "") {
      alert("Fill all the field");
      setLoading(false);
      return;
    }

    console.log({
      email: authForm.email,
      password: authForm.password
    })

    try {
      const res = await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      console.log(res);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm({
      ...authForm,
      [name]: value
    });
  };

  return (
    <div className="border flex flex-col w-72 p-5 gap-3">
      <input
        type="email"
        name="email"
        value={authForm.email}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 border rounded-lg focus:outline-none"
      />
      <input
        type="password"
        name="password"
        value={authForm.password}
        onChange={handleChange}
        placeholder="Password"
        className="border p-2 border rounded-lg focus:outline-none"
      />
      <button 
        onClick={handleClick}
        className="border p-2 rounded-lg bg-gray-200 hover:bg-gray-300 hover:text-green-600 hover:font-bold"  
      >
        Sign In {loading ? " ..." : ""}
      </button>
    </div>
  );
};
