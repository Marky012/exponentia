import HubCarousel from '@/components/HubCarousel';
import { InstallButton } from '@/components/InstallButton';

const GameHub = () => {
  return (
    <div className="relative">
      <HubCarousel />
      
      {/* Install Button */}
      <div className="fixed bottom-16 right-4 z-30">
        <InstallButton />
      </div>
    </div>
  );
};

export default GameHub;
