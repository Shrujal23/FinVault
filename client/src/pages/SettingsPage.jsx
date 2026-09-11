import SettingsExperience from '../components/settings/SettingsExperience.jsx';
import { useAuth } from '../hooks/useAuth';
import useAppNavigate from '../hooks/useAppNavigate';

export default function SettingsPage() {
  const auth = useAuth();
  const navigate = useAppNavigate();
  return <SettingsExperience variant="page" auth={auth} setCurrentPage={navigate} />;
}
