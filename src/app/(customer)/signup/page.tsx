import Signup from '@/views/customer/Signup';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}
