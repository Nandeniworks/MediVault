import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { UserPlus, FileUp, ListOrdered, Share2 } from 'lucide-react';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create your Health Vault',
      desc: 'Generate a self-sovereign cryptographic identity. MediVault establishes your unique Vault address entirely sandboxed, ensuring keys remain local.',
      icon: <UserPlus size={20} />,
      badge: 'Immediate Setup'
    },
    {
      num: '02',
      title: 'Add your medical records',
      desc: 'Drag and drop lab PDFs, doctor prescriptions, imaging links, or vaccination cards. MediVault indexes each document securely on client side.',
      icon: <FileUp size={20} />,
      badge: 'Zero-Knowledge Indexing'
    },
    {
      num: '03',
      title: 'Build your medical timeline',
      desc: 'Watch your historical test results organize into a lifelong timeline. Spot trends in blood metrics, medications, and care instructions.',
      icon: <ListOrdered size={20} />,
      badge: 'Automated Sequencing'
    },
    {
      num: '04',
      title: 'Share selected records with consent',
      desc: 'Review doctor requests in real-time. Choose specifically which reports to reveal, and set temporary permissions that expire automatically.',
      icon: <Share2 size={20} />,
      badge: 'Granular Access'
    }
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <Badge variant="lavender">The Connected Journey</Badge>
          <h2 className="section-title">How MediVault Works</h2>
          <p className="section-desc">
            A unified four-step flow designed to restore ownership over your medical history, keeping your details private.
          </p>
        </div>

        {/* Alternating Connected Journey Grid */}
        <div className="timeline-journey">
          
          {/* Vertical central pipeline line */}
          <div className="timeline-pipeline">
            <div className="pipeline-glow-bar"></div>
          </div>

          {steps.map((step, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div key={idx} className={`timeline-row ${isLeft ? 'row-left' : 'row-right'}`}>
                
                {/* Visual Card Node */}
                <div className="timeline-card-wrapper">
                  <Card className="journey-card" hoverable interactiveGlow padding="md">
                    <div className="journey-card-top">
                      <div className="journey-icon-box">
                        {step.icon}
                      </div>
                      <Badge variant="mint">{step.badge}</Badge>
                    </div>
                    <h3 className="journey-step-title">{step.title}</h3>
                    <p className="journey-step-desc">{step.desc}</p>
                  </Card>
                </div>

                {/* Central Circle Pin */}
                <div className="timeline-pin-wrapper">
                  <div className="timeline-pin">
                    <span className="pin-number">{step.num}</span>
                  </div>
                </div>

                {/* Empty side for layout alignment */}
                <div className="timeline-empty-side"></div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
