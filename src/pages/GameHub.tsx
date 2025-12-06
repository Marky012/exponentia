import { motion } from 'framer-motion';
import VerticalGameMap from '@/components/VerticalGameMap';
import { InstallButton } from '@/components/InstallButton';
import { SettingsMenu } from '@/components/SettingsMenu';

const GameHub = () => {
  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VerticalGameMap />
      
      {/* Settings and Install Buttons */}
      <div className="fixed top-4 right-4 z-30">
        <SettingsMenu />
      </div>
      <div className="fixed bottom-4 right-4 z-30">
        <InstallButton />
      </div>
    </motion.div>
  );
};

export default GameHub;
