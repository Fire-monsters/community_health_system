module.exports = {
  BATCH_SIZE: parseInt(process.env.SYNC_BATCH_SIZE) || 100,
  // Per-table conflict strategy: 'manual' or 'server_wins' or 'client_wins'
  conflictStrategies: {
    patients: 'manual',
    encounters: 'manual',
    vitals: 'manual',      // clinical data – manual
    appointments: 'server_wins',
    prescriptions: 'manual',
    referrals: 'manual'
  }
};