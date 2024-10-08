import { Dialog } from '@headlessui/react';
import { lazy, Suspense, useState } from 'react';
import { Outlet, RouteObject, useRoutes, BrowserRouter } from 'react-router-dom';
import { useAuthState, useSignOut } from '../contexts/UserContext';
import Nav from "../ui/Nav"
const Loading = () => <p className="p-4 w-full h-full text-center">Loading...</p>;

const IndexScreen = lazy(() => import('~/components/screens/Index'));
const Page404Screen = lazy(() => import('~/components/screens/404'));
const AuthScreen = lazy(() =>  import('~/components/screens/Auth'));
const Challenge = lazy(() =>  import('~/components/screens/Challenge'));
const Play = lazy(() => import('~/components/screens/Play'));

function Layout() {
  return (
    <div className=''>
      <Nav/>
      <Outlet />
    </div>
  );
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
};

const InnerRouter = () => {

  const { state } = useAuthState();

  const page = (state.state == 'SIGNED_IN') ? <IndexScreen /> : <AuthScreen/>


  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: page,
        },
        
        {
          path: '*',
          element: <Page404Screen />,
        },
      ],
    },
    {
      path: '/challenge',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Challenge/>,
        }
      ],
    },
    {
      path: '/play/:id',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Play/>,
        }
      ],
    },
  ];
  const element = useRoutes(routes);
  return (
    <div>
      <Suspense fallback={<Loading />}>{element}</Suspense>
    </div>
  );
};
