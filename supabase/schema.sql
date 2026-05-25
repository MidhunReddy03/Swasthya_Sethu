-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (Patients, Doctors, ASHA Workers)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('patient', 'doctor', 'asha')) not null default 'patient',
  phone text,
  avatar_url text,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Doctor specific details
create table doctor_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  specialization text not null,
  license_number text unique not null,
  experience_years int default 0,
  consultation_fee numeric default 0,
  is_available boolean default true,
  rating numeric default 0.0,
  bio text,
  languages_spoken text[] default array['en'],
  hospital text,
  degree text,
  qualification text
);

-- ASHA worker specific details
create table asha_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  region text not null,
  assigned_villages text[] default array[]::text[],
  patients_managed int default 0
);

-- Patient health records
create table health_records (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  doctor_id uuid references profiles(id),
  diagnosis text not null,
  symptoms text[] default array[]::text[],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prescriptions
create table prescriptions (
  id uuid default uuid_generate_v4() primary key,
  record_id uuid references health_records(id) on delete cascade not null,
  doctor_id uuid references profiles(id) not null,
  patient_id uuid references profiles(id) not null,
  medicines jsonb not null, -- [{name, dosage, duration, frequency}]
  advice text,
  follow_up_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references profiles(id) not null,
  doctor_id uuid references profiles(id) not null,
  asha_id uuid references profiles(id), -- Optional: booked via ASHA
  scheduled_at timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  consultation_type text check (consultation_type in ('video', 'audio', 'chat')) default 'video',
  meeting_id text, -- For WebRTC/PeerJS
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages
create table messages (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references appointments(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Symptom Triage Logs (For analytics & improvement)
create table triage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  symptoms text[] not null,
  ai_suggestion text,
  urgency_level text check (urgency_level in ('low', 'medium', 'high', 'emergency')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table doctor_profiles enable row level security;
alter table asha_profiles enable row level security;
alter table health_records enable row level security;
alter table prescriptions enable row level security;
alter table appointments enable row level security;
alter table messages enable row level security;
alter table triage_logs enable row level security;

-- Profiles: Users can view their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Doctors: Publicly viewable for booking
create policy "Anyone can view doctors" on doctor_profiles for select using (true);

-- Appointments: Users can view their own appointments
create policy "Users can view own appointments" on appointments for select using (auth.uid() = patient_id or auth.uid() = doctor_id or auth.uid() = asha_id);
create policy "Patients can create appointments" on appointments for insert with check (auth.uid() = patient_id);
create policy "Doctors can update appointments" on appointments for update using (auth.uid() = doctor_id);

-- Health Records: Patient and Doctor access
create policy "Patients can view own records" on health_records for select using (auth.uid() = patient_id);
create policy "Doctors can view assigned records" on health_records for select using (auth.uid() = doctor_id);
create policy "Doctors can create records" on health_records for insert with check (auth.uid() = doctor_id);

-- Prescriptions: Patient and Doctor access
create policy "Patients can view own prescriptions" on prescriptions for select using (auth.uid() = patient_id);
create policy "Doctors can manage prescriptions" on prescriptions for all using (auth.uid() = doctor_id);

-- Messages: Participants only
create policy "Users can view messages for their appointments" on messages for select using (
  exists (
    select 1 from appointments 
    where appointments.id = messages.appointment_id 
    and (appointments.patient_id = auth.uid() or appointments.doctor_id = auth.uid())
  )
);
create policy "Users can send messages for their appointments" on messages for insert with check (
  exists (
    select 1 from appointments 
    where appointments.id = messages.appointment_id 
    and (appointments.patient_id = auth.uid() or appointments.doctor_id = auth.uid())
  )
);

-- Functions for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
before update on profiles
for each row
execute procedure update_updated_at_column();

-- Notifications table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('appointment', 'message', 'payment', 'system')) default 'system',
  related_id text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (true);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- Payment status for appointments
alter table appointments add column if not exists payment_status text check (payment_status in ('pending', 'completed', 'waived')) default 'pending';
alter table appointments add column if not exists notes text;
