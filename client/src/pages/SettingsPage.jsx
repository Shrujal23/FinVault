import SettingsExperience from '../components/settings/SettingsExperience.jsx';

export default function SettingsPage({ auth, setCurrentPage }) {
  return <SettingsExperience variant="page" auth={auth} setCurrentPage={setCurrentPage} />;
}
