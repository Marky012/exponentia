import HubCarousel from '@/components/HubCarousel';
import { InstallButton } from '@/components/InstallButton';
import { SettingsMenu } from '@/components/SettingsMenu';

const GameHub = () => {
  return (
    <div className="relative">
      <HubCarousel />
      
      {/* Settings button */}
      <div className="fixed top-4 right-4 z-30">
        <SettingsMenu />
      </div>
      
      {/* Install Button */}
      <div className="fixed bottom-16 right-4 z-30">
        <InstallButton />
      </div>
    </div>
  );
};

export default GameHub;
