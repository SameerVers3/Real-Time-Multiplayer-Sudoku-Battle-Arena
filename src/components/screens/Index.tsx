import { Dialog } from '@headlessui/react';
import { useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import RecentlyPlayed from "~/components/ui/RecentlyPlayed"
import HeroCard from "~/components/ui/HeroCard"

function Index() {
  const { state } = useAuthState();
  const [isOpen, setIsOpen] = useState(true);
  const completeButtonRef = useRef(null);

  return (
    <>
      <Head title="TOP PAGE" />

      <div className='flex w-full border justify-between flex-row'>
        <HeroCard/>
        <RecentlyPlayed/>
      </div>
    </>
  );
}

export default Index;
