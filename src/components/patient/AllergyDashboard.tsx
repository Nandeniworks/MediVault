import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TextInput, SelectInput } from '../common/FormElements';
import { 
  Plus, Calendar, User, Building, Trash2, Pill, Utensils, 
  Trees, Flame, Check
} from 'lucide-react';

interface Allergy {
  id: string;
  name: string;
  category: 'Drug' | 'Food' | 'Environmental' | 'Emergency';
  severity: 'Severe' | 'Moderate' | 'Mild';
  reactions: string[];
  dateAdded: string;
  doctor: string;
  hospital: string;
}

export const AllergyDashboard: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: 'all-1',
      name: 'Penicillin',
      category: 'Drug',
      severity: 'Severe',
      reactions: ['Rash', 'Difficulty Breathing'],
      dateAdded: '2026-01-10',
      doctor: 'Dr. Sarah Jenkins',
      hospital: 'CityCare Hospital'
    },
    {
      id: 'all-2',
      name: 'Peanuts',
      category: 'Food',
      severity: 'Moderate',
      reactions: ['Hives'],
      dateAdded: '2025-09-21',
      doctor: 'Dr. Amit Patel',
      hospital: 'Nova Diagnostic Centre'
    },
    {
      id: 'all-3',
      name: 'Dust',
      category: 'Environmental',
      severity: 'Mild',
      reactions: ['Sneezing', 'Eye irritation'],
      dateAdded: '2025-03-14',
      doctor: 'Dr. Sarah Jenkins',
      hospital: 'Apex Diagnostics'
    }
  ]);

  // Form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Drug' | 'Food' | 'Environmental' | 'Emergency'>('Drug');
  const [newSeverity, setNewSeverity] = useState<'Severe' | 'Moderate' | 'Mild'>('Mild');
  const [newReactions, setNewReactions] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newHospital, setNewHospital] = useState('');

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDoctor.trim() || !newHospital.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const newAllergy: Allergy = {
      id: `all-${Date.now()}`,
      name: newName,
      category: newCategory,
      severity: newSeverity,
      reactions: newReactions.split(',').map(r => r.trim()).filter(Boolean),
      dateAdded: new Date().toISOString().split('T')[0],
      doctor: newDoctor,
      hospital: newHospital
    };

    setAllergies([newAllergy, ...allergies]);
    setIsAddModalOpen(false);

    // Reset fields
    setNewName('');
    setNewCategory('Drug');
    setNewSeverity('Mild');
    setNewReactions('');
    setNewDoctor('');
    setNewHospital('');
  };

  const handleDelete = (id: string) => {
    setAllergies(allergies.filter(a => a.id !== id));
  };

  const getSeverityStyles = (severity: Allergy['severity']) => {
    switch (severity) {
      case 'Severe':
        return {
          borderColor: 'rgba(239, 68, 68, 0.4)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.01) 100%)',
          color: '#ef4444',
          badgeColor: 'danger' as const
        };
      case 'Moderate':
        return {
          borderColor: 'rgba(249, 115, 22, 0.4)',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.01) 100%)',
          color: '#f97316',
          badgeColor: 'warning' as const
        };
      case 'Mild':
        default:
        return {
          borderColor: 'rgba(234, 179, 8, 0.4)',
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.01) 100%)',
          color: '#eab308',
          badgeColor: 'info' as const
        };
    }
  };

  const getSectionIcon = (category: Allergy['category']) => {
    switch (category) {
      case 'Drug':
        return <Pill size={18} className="text-violet-400" />;
      case 'Food':
        return <Utensils size={18} className="text-amber-400" />;
      case 'Environmental':
        return <Trees size={18} className="text-teal-400" />;
      case 'Emergency':
        return <Flame size={18} className="text-red-400" />;
    }
  };

  const categories: Allergy['category'][] = ['Drug', 'Food', 'Environmental', 'Emergency'];

  return (
    <div className="health-vault-container">
      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Allergy & Adverse Reactions</h2>
          <p className="vault-sub-text">Manage and document confirmed substance allergies for clinical decision support.</p>
        </div>
        <Button 
          variant="primary" 
          size="md"
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Allergy
        </Button>
      </div>

      {/* Main sections layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        {categories.map((cat) => {
          const catAllergies = allergies.filter(a => a.category === cat);
          return (
            <div key={cat} style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              backdropFilter: 'blur(16px)'
            }}>
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                {getSectionIcon(cat)}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
                  {cat} Allergies
                </h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '10px', 
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}>
                  {catAllergies.length}
                </span>
              </div>

              {/* Grid of Allergy Cards */}
              {catAllergies.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                  No documented {cat.toLowerCase()} allergies.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {catAllergies.map((allergy) => {
                    const styles = getSeverityStyles(allergy.severity);
                    return (
                      <Card 
                        key={allergy.id} 
                        className="record-grid-card border-glow-hover"
                        padding="none"
                        style={{
                          border: `1px solid ${styles.borderColor}`,
                          background: styles.background,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          position: 'relative'
                        }}
                      >
                        <div style={{ padding: '1.25rem' }}>
                          {/* Card header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                              {allergy.name}
                            </h4>
                            <Badge variant={styles.badgeColor}>
                              {allergy.severity}
                            </Badge>
                          </div>

                          {/* Reactions */}
                          <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                              Reactions
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {allergy.reactions.map((reaction, i) => (
                                <span key={i} style={{ 
                                  fontSize: '0.78rem', 
                                  background: 'rgba(255, 255, 255, 0.04)', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: 'var(--radius-xs)', 
                                  color: 'var(--text-primary)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)'
                                }}>
                                  {reaction}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.4rem', 
                            fontSize: '0.82rem', 
                            color: 'var(--text-secondary)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            paddingTop: '0.75rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={13} className="text-muted" />
                              <span>Added: <strong>{new Date(allergy.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={13} className="text-muted" />
                              <span>Doctor: <strong>{allergy.doctor}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Building size={13} className="text-muted" />
                              <span>Hospital: <strong>{allergy.hospital}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ 
                          padding: '0.5rem 1.25rem', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          background: 'rgba(0, 0, 0, 0.05)'
                        }}>
                          <button 
                            onClick={() => handleDelete(allergy.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: 'var(--radius-xs)',
                              transition: 'color 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            title="Remove Allergy"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Allergy Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Documented Allergy"
      >
        <form onSubmit={handleAddAllergy} className="wizard-form-grid" style={{ padding: 0 }}>
          <TextInput 
            label="Allergen Name (e.g. Penicillin, Peanuts)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="form-double-col">
            <SelectInput 
              label="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              options={[
                { value: 'Drug', label: 'Drug Allergy' },
                { value: 'Food', label: 'Food Allergy' },
                { value: 'Environmental', label: 'Environmental Allergy' },
                { value: 'Emergency', label: 'Emergency Allergy' }
              ]}
              required
            />

            <SelectInput 
              label="Severity"
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as any)}
              options={[
                { value: 'Mild', label: 'Mild (Yellow)' },
                { value: 'Moderate', label: 'Moderate (Orange)' },
                { value: 'Severe', label: 'Severe (Red)' }
              ]}
              required
            />
          </div>

          <TextInput 
            label="Reactions (Comma-separated, e.g. Rash, Hives)"
            value={newReactions}
            onChange={(e) => setNewReactions(e.target.value)}
            placeholder="Rash, Sneezing, Difficulty Breathing"
          />

          <div className="form-double-col">
            <TextInput 
              label="Diagnosing Doctor"
              value={newDoctor}
              onChange={(e) => setNewDoctor(e.target.value)}
              required
            />

            <TextInput 
              label="Hospital / Clinic"
              value={newHospital}
              onChange={(e) => setNewHospital(e.target.value)}
              required
            />
          </div>

          <div className="modal-action-row" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
              Save Allergy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
