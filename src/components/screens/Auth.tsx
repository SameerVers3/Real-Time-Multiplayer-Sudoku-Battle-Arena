import react from "react"
import { SignInButton } from "../domain/auth/SignInButton"
import { SignInForm } from "../domain/auth/SignInForm"

const Auth = () => {
  
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="border w-96 flex flex-col justify-center items-center p-8">
      <SignInButton />

      <div className="w-72 bg-gray border-t m-5"></div>
        <SignInForm />
      </div>
    </div>
  )


}

export default Auth