import { redirect } from 'next/navigation';

export default function CreateSpacePage() {
  redirect('/admin/spaces?action=create');
}
