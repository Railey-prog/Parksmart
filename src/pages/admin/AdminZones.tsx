import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { MapPin, Plus, Edit2, Trash2, Zap, Accessibility } from 'lucide-react';
import { SlotStatus, Zone, Slot } from '../../types';
export const AdminZones = () => {
  const {
    zones,
    updateSlotStatus,
    createZone,
    updateZone,
    deleteZone,
    createSlot,
    deleteSlot
  } = useParking();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  // Zone Modal State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    capacity: 0
  });
  // Slot Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    name: '',
    isEV: false,
    isAccessible: false
  });
  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'danger';
      case 'RESERVED':
        return 'warning';
      case 'MAINTENANCE':
        return 'neutral';
      default:
        return 'neutral';
    }
  };
  const handleOpenZoneModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name: zone.name,
        description: zone.description,
        capacity: zone.capacity
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name: '',
        description: '',
        capacity: 10
      });
    }
    setIsZoneModalOpen(true);
  };
  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateZone(editingZone.id, zoneForm);
    } else {
      createZone(zoneForm);
    }
    setIsZoneModalOpen(false);
  };
  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedZoneId) {
      createSlot(selectedZoneId, slotForm);
      setIsSlotModalOpen(false);
      setSlotForm({
        name: '',
        isEV: false,
        isAccessible: false
      });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Zone & Slot Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage parking zones and slot status
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenZoneModal()}>
          
          Add Zone
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const available = zone.slots.filter(
            (s) => s.status === 'AVAILABLE'
          ).length;
          const occupied = zone.slots.filter(
            (s) => s.status === 'OCCUPIED' || s.status === 'RESERVED'
          ).length;
          const occupancyRate =
          zone.capacity > 0 ? Math.round(occupied / zone.capacity * 100) : 0;
          return (
            <GlassCard
              key={zone.id}
              hoverEffect
              onClick={() => setSelectedZoneId(zone.id)}
              className={
              selectedZoneId === zone.id ? 'border-indigo-500/50' : ''
              }>
              
              <div className="flex items-start justify-between mb-3">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <Badge
                  variant={
                  occupancyRate > 80 ?
                  'danger' :
                  occupancyRate > 50 ?
                  'warning' :
                  'success'
                  }>
                  
                  {occupancyRate}%
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{zone.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{zone.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">{available} Available</span>
                <span className="text-slate-400">{zone.capacity} Total</span>
              </div>
            </GlassCard>);

        })}
      </div>

      {selectedZone &&
      <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedZone.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Manage slot statuses
              </p>
            </div>
            <div className="flex gap-2">
              <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSlotModalOpen(true)}>
              
                Add Slot
              </Button>
              <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenZoneModal(selectedZone)}>
              
                Edit Zone
              </Button>
              <Button
              variant="danger"
              size="sm"
              onClick={() => {
                deleteZone(selectedZone.id);
                setSelectedZoneId(null);
              }}>
              
                Delete Zone
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedZone.slots.map((slot) =>
          <div
            key={slot.id}
            className="bg-black/20 rounded-lg p-3 border border-white/10 relative group">
            
                <button
              onClick={() => deleteSlot(selectedZone.id, slot.id)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="text-center mb-2">
                  <div className="flex justify-center gap-1 mb-1">
                    {slot.isEV && <Zap className="w-3 h-3 text-cyan-400" />}
                    {slot.isAccessible &&
                <Accessibility className="w-3 h-3 text-blue-400" />
                }
                  </div>
                  <p className="font-bold text-white text-sm">{slot.name}</p>
                  <Badge
                variant={getStatusColor(slot.status)}
                className="mt-1 text-[10px]">
                
                    {slot.status}
                  </Badge>
                </div>
                <select
              value={slot.status}
              onChange={(e) =>
              updateSlotStatus(
                selectedZone.id,
                slot.id,
                e.target.value as SlotStatus
              )
              }
              className="glass-input w-full px-2 text-xs">
              
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
          )}
          </div>
        </GlassCard>
      }

      {/* Zone Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={editingZone ? 'Edit Zone' : 'Add Zone'}>
        
        <form onSubmit={handleZoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              required
              type="text"
              value={zoneForm.name}
              onChange={(e) =>
              setZoneForm({
                ...zoneForm,
                name: e.target.value
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <input
              required
              type="text"
              value={zoneForm.description}
              onChange={(e) =>
              setZoneForm({
                ...zoneForm,
                description: e.target.value
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Capacity
            </label>
            <input
              required
              type="number"
              min="1"
              value={zoneForm.capacity}
              onChange={(e) =>
              setZoneForm({
                ...zoneForm,
                capacity: parseInt(e.target.value)
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsZoneModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingZone ? 'Save Changes' : 'Create Zone'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Add Slot">
        
        <form onSubmit={handleSlotSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Slot Name (e.g. N-01)
            </label>
            <input
              required
              type="text"
              value={slotForm.name}
              onChange={(e) =>
              setSlotForm({
                ...slotForm,
                name: e.target.value
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={slotForm.isEV}
                onChange={(e) =>
                setSlotForm({
                  ...slotForm,
                  isEV: e.target.checked
                })
                }
                className="rounded bg-black/20 border-white/10 text-indigo-500 focus:ring-indigo-500/50" />
              
              EV Charging
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={slotForm.isAccessible}
                onChange={(e) =>
                setSlotForm({
                  ...slotForm,
                  isAccessible: e.target.checked
                })
                }
                className="rounded bg-black/20 border-white/10 text-indigo-500 focus:ring-indigo-500/50" />
              
              Accessible
            </label>
          </div>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsSlotModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>);

};