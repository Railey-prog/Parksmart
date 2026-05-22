import React from 'react';
import { ParkingMap } from '../../components/parking/ParkingMap';
export const SecurityMap = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Live Map Monitoring</h1>
        <p className="text-slate-400 mt-1">
          Read-only view of current parking status
        </p>
      </div>
      <ParkingMap interactive={false} />
    </div>);

};