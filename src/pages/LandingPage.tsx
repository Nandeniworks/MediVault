import React from 'react';
import { Hero } from '../components/landing/Hero';
import { Problem } from '../components/landing/Problem';
import { HowItWorks } from '../components/landing/HowItWorks';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { ConsentFlow } from '../components/landing/ConsentFlow';
import { Audiences } from '../components/landing/Audiences';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onCreateVaultClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateVaultClick }) => {
  return (
    <div className="landing-page">
      <Hero onCreateVaultClick={onCreateVaultClick} />
      
      <Problem />
      
      <HowItWorks />
      
      <DashboardPreview />
      
      <ConsentFlow />
      
      <Audiences />

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="glow-ambient final-cta-glow"></div>
        <div className="container final-cta-container">
          <div className="final-cta-card">
            <Badge variant="mint">Platform Initial Release</Badge>
            <h2 className="final-cta-title">Your medical history belongs with you.</h2>
            <p className="final-cta-desc">
              Take custody of your diagnostic reports and authorize clinics in real-time. Start building your secure digital health record today.
            </p>
            <div className="final-cta-actions">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<ArrowRight size={18} />} 
                iconPosition="right"
                onClick={onCreateVaultClick}
              >
                Create Your Health Vault
              </Button>
            </div>
            <div className="final-cta-footer">
              <span className="info-badge-item">
                <ShieldCheck size={14} className="text-mint" /> Private, patient-custody framework
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
