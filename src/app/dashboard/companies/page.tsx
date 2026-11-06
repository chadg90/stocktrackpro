import { permanentRedirect } from 'next/navigation';

/** Companies moved under the super-admin ADMIN section. */
export default function CompaniesRedirectPage() {
  permanentRedirect('/dashboard/admin/companies/');
}
