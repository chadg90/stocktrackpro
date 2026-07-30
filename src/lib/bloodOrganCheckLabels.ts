/**
 * Labels for Blood/Organ inspection checks — mirrored from the mobile template
 * (STP/services/inspections/bloodOrganTemplate.ts, v2026-07-blood-organ-v3).
 * Includes legacy check ids so historic inspections still render.
 */

export const BLOOD_ORGAN_PHOTO_LABELS: Record<string, string> = {
  front: 'Front Exterior',
  rear: 'Rear Exterior',
  driver_side: 'Driver Side',
  passenger_side: 'Passenger Side',
  interior: 'Interior / Load Area',
  mileage: 'Mileage / Odometer',
};

export const BLOOD_ORGAN_SECTION_ORDER = [
  'exterior',
  'lights',
  'emergency_warning',
  'tyres',
  'fluids',
  'in_cab',
  'patient_area',
  'equipment',
  'security',
  'medical',
  'cleanliness',
] as const;

export const BLOOD_ORGAN_SECTION_TITLES: Record<string, string> = {
  exterior: 'Exterior',
  lights: 'Vehicle Lights',
  emergency_warning: 'Emergency Warning System',
  tyres: 'Tyres and Wheels',
  fluids: 'Under the Bonnet',
  in_cab: 'Cab',
  patient_area: 'Patient Area',
  equipment: 'Equipment',
  security: 'Vehicle Security / Key Lock Box',
  medical: 'Medical Transport Equipment',
  cleanliness: 'Cleanliness and Readiness',
};

export const FUEL_LEVEL_LABELS: Record<number, string> = {
  1: 'Empty',
  2: 'Quarter',
  3: 'Half',
  4: 'Three quarters',
  5: 'Full',
};

export const FLUID_STATUS_LABELS: Record<string, string> = {
  ok: 'OK',
  low_topped_up: 'Low—topped up',
  low_unable: 'Low—unable to top up',
  leak_problem: 'Leak/problem identified',
};

export const BLOOD_ORGAN_CHECK_LABELS: Record<string, { title: string; sectionId: string }> = {
  // Exterior (v3)
  ext_damage: { title: 'Existing / new damage', sectionId: 'exterior' },
  ext_windscreen_mirrors: { title: 'Windscreen and mirrors', sectionId: 'exterior' },
  ext_wipers: { title: 'Wipers', sectionId: 'exterior' },
  ext_tyres_tread: { title: 'Tyres and tread', sectionId: 'exterior' },
  ext_brakes: { title: 'Brake / handbrake test', sectionId: 'exterior' },
  ext_standard_lights: { title: 'Standard lights', sectionId: 'exterior' },
  ext_emergency_lights: { title: 'Emergency lights, siren and horn', sectionId: 'exterior' },

  // Exterior (legacy)
  ext_bodywork: { title: 'Bodywork and exterior condition', sectionId: 'exterior' },
  ext_windscreen_glass: { title: 'Windscreen and glass', sectionId: 'exterior' },
  ext_mirrors: { title: 'Side mirrors', sectionId: 'exterior' },
  ext_number_plates: { title: 'Number plates', sectionId: 'exterior' },
  ext_wipers_washers: { title: 'Windscreen wipers and washers', sectionId: 'exterior' },
  ext_doors_secure: { title: 'Doors, bonnet and boot secure', sectionId: 'exterior' },
  ext_fluid_leaks: { title: 'No visible fluid leaks', sectionId: 'exterior' },

  // Vehicle Lights (legacy)
  lights_head_side: { title: 'Headlights and side lights', sectionId: 'lights' },
  lights_drl: { title: 'Daytime running lights', sectionId: 'lights' },
  lights_full_beam: { title: 'Main / full beam', sectionId: 'lights' },
  lights_fog: { title: 'Fog lights', sectionId: 'lights' },
  lights_brake: { title: 'Brake lights', sectionId: 'lights' },
  lights_indicators: { title: 'Indicators and hazard lights', sectionId: 'lights' },
  lights_reverse: { title: 'Reverse lights', sectionId: 'lights' },
  lights_plate: { title: 'Registration plate lights', sectionId: 'lights' },

  // Emergency Warning System (legacy)
  lights_blue: { title: 'Emergency / blue warning lights', sectionId: 'emergency_warning' },
  ew_scene_lights: { title: 'Scene lights', sectionId: 'emergency_warning' },
  lights_siren: { title: 'Siren', sectionId: 'emergency_warning' },
  ew_bullhorn: { title: 'Bull horn / PA', sectionId: 'emergency_warning' },
  ew_reverse_alarm: { title: 'Reverse alarm', sectionId: 'emergency_warning' },
  lights_beacon: { title: 'Warning beacon', sectionId: 'emergency_warning' },

  // Tyres and Wheels (legacy)
  tyre_tread: { title: 'Tyre tread and general condition', sectionId: 'tyres' },
  tyre_damage: { title: 'No cuts, bulges or exposed cords', sectionId: 'tyres' },
  tyre_inflation: { title: 'Tyre pressures appear correct', sectionId: 'tyres' },
  tyre_wheel_nuts: { title: 'Wheels and wheel nuts secure', sectionId: 'tyres' },
  tyre_spare_or_kit: {
    title: 'Spare wheel or tyre repair kit present where applicable',
    sectionId: 'tyres',
  },

  // Under the Bonnet (v3 + legacy)
  fluid_oil: { title: 'Oil level', sectionId: 'fluids' },
  fluid_coolant: { title: 'Coolant level', sectionId: 'fluids' },
  fluid_washer: { title: 'Washer fluid', sectionId: 'fluids' },
  fluid_screenwash: { title: 'Washer fluid level', sectionId: 'fluids' },
  fluid_dash_warnings: { title: 'No dashboard warning lights', sectionId: 'fluids' },
  fluid_fuel_battery: { title: 'Fuel or battery charge sufficient', sectionId: 'fluids' },
  fluid_steering: { title: 'Steering operating correctly', sectionId: 'fluids' },
  fluid_mech_issues: { title: 'No visible leaks or unusual mechanical issues', sectionId: 'fluids' },

  // Cab (v3)
  cab_warning_lights: { title: 'Warning lights', sectionId: 'in_cab' },
  cab_seatbelts: { title: 'Seatbelts', sectionId: 'in_cab' },
  cab_heating_ac: { title: 'Heating / air conditioning', sectionId: 'in_cab' },
  cab_radio_mdt: { title: 'Radio / MDT / navigation', sectionId: 'in_cab' },
  cab_interior_lighting: { title: 'Interior lighting', sectionId: 'in_cab' },
  cab_documents: { title: 'Required documents', sectionId: 'in_cab' },
  cab_lockbox_secure: { title: 'Key lock box secure', sectionId: 'in_cab' },
  cab_lockbox_key_returned: {
    title: 'Lock box key returned to station key safe',
    sectionId: 'in_cab',
  },

  // Cab (legacy)
  cab_service_brake: { title: 'Brakes (service brake)', sectionId: 'in_cab' },
  cab_parking_brake: { title: 'Handbrake / parking brake', sectionId: 'in_cab' },
  cab_horn: { title: 'Horn', sectionId: 'in_cab' },
  cab_heating: { title: 'Heating / AC and demisting', sectionId: 'in_cab' },
  cab_seat_controls: { title: 'Driver seat and controls', sectionId: 'in_cab' },
  cab_radio: { title: 'Radio / stereo', sectionId: 'in_cab' },
  cab_satnav: { title: 'Navigation / MDT system', sectionId: 'in_cab' },
  cab_comms: { title: 'Communication equipment', sectionId: 'in_cab' },
  cab_document_folder: { title: 'Document folder', sectionId: 'in_cab' },

  // Patient Area (v3)
  pa_seatbelts: { title: 'Seatbelts', sectionId: 'patient_area' },
  pa_heating_lights: { title: 'Heating and saloon lighting', sectionId: 'patient_area' },
  pa_cleanliness: { title: 'Cleanliness', sectionId: 'patient_area' },
  pa_consumables: { title: 'Consumable stock', sectionId: 'patient_area' },
  pa_linen: { title: 'Linen', sectionId: 'patient_area' },
  pa_ppe: { title: 'PPE', sectionId: 'patient_area' },
  pa_medication_safe: { title: 'Medication safe', sectionId: 'patient_area' },
  pa_med_pouch: { title: 'Medication pouch assigned for this shift', sectionId: 'patient_area' },

  // Patient Area (legacy)
  pa_heating_ac: { title: 'Heating / AC (load / patient area)', sectionId: 'patient_area' },
  pa_saloon_lights: { title: 'Saloon / load area lights', sectionId: 'patient_area' },

  // Equipment (v3)
  eq_stretcher: { title: 'Stretcher', sectionId: 'equipment' },
  eq_scoop_stretcher: { title: 'Scoop stretcher', sectionId: 'equipment' },
  eq_carry_chair: { title: 'Carry chair', sectionId: 'equipment' },
  eq_pedimate: { title: 'PediMate', sectionId: 'equipment' },
  eq_aed_monitor: { title: 'Monitor / AED', sectionId: 'equipment' },
  eq_suction: { title: 'Suction', sectionId: 'equipment' },
  eq_response_bags: { title: 'Response bags', sectionId: 'equipment' },
  eq_oxygen_entonox: { title: 'Oxygen and Entonox', sectionId: 'equipment' },
  eq_fire_extinguisher: { title: 'Fire extinguisher', sectionId: 'equipment' },
  eq_emergency_hammer: { title: 'Emergency hammer', sectionId: 'equipment' },

  // Equipment (legacy)
  eq_suction_unit: { title: 'Suction unit', sectionId: 'equipment' },
  eq_primary_bag: { title: 'Primary response bag (BLS)', sectionId: 'equipment' },
  eq_secondary_bag: { title: 'Secondary response bag (ILS/ALS)', sectionId: 'equipment' },
  eq_oxygen_bag: { title: 'Oxygen bag', sectionId: 'equipment' },
  eq_entonox_bag: { title: 'Entonox bag', sectionId: 'equipment' },

  // Vehicle Security / Key Lock Box (legacy — now under Cab)
  sec_lockbox_secure: { title: 'Vehicle key lock box secure', sectionId: 'security' },
  sec_lockbox_key_returned: {
    title: 'Lock box key returned to station key safe',
    sectionId: 'security',
  },

  // Medical Transport Equipment (legacy)
  med_container_present: { title: 'Medical transport container present', sectionId: 'medical' },
  med_container_secure: { title: 'Transport container secure', sectionId: 'medical' },
  med_container_clean: { title: 'Transport container clean', sectionId: 'medical' },
  med_container_undamaged: { title: 'Transport container undamaged', sectionId: 'medical' },
  med_coolbox_present: { title: 'Cool box present where required', sectionId: 'medical' },
  med_coolbox_suitable: { title: 'Cool box clean and suitable for use', sectionId: 'medical' },
  med_temp_present: { title: 'Temperature monitor present where required', sectionId: 'medical' },
  med_temp_operational: { title: 'Temperature monitor operational', sectionId: 'medical' },
  med_pouch_assigned: {
    title: 'Medication pouch assigned and security sealed',
    sectionId: 'medical',
  },
  med_pouch_in_safe: { title: 'Medication pouch placed into vehicle safe', sectionId: 'medical' },
  med_load_restraints: { title: 'Load restraints secure', sectionId: 'medical' },
  med_equipment_stored: {
    title: 'Medical transport equipment securely stored',
    sectionId: 'medical',
  },
  med_paperwork: {
    title: 'Required paperwork or emergency contacts available',
    sectionId: 'medical',
  },

  // Cleanliness and Readiness (legacy)
  clean_cab: { title: 'Cab clean', sectionId: 'cleanliness' },
  clean_load_area: { title: 'Load area clean', sectionId: 'cleanliness' },
  clean_transport_equipment: { title: 'Transport equipment clean', sectionId: 'cleanliness' },
  clean_no_contamination: { title: 'No visible contamination', sectionId: 'cleanliness' },
  clean_waste: { title: 'Waste removed', sectionId: 'cleanliness' },
  clean_ready: { title: 'Vehicle ready for operational use', sectionId: 'cleanliness' },
};

export const CAR_VAN_WALKAROUND_LABELS: Record<string, string> = {
  external_condition: 'External Condition',
  tyres_wheels: 'Tyres & Wheels',
  fluid_levels: 'Fluid Levels',
  load_security: 'Load Security',
  in_cab_checks: 'In-Cab Checks',
  final_confirm: 'Final declaration',
};
