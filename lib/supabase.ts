import { createClient } from "@supabase/supabase-js"

// Типы для базы данных
export type Company = {
  id: string
  name: string
  registration_number: string
  country: string
  address: string
  contact_name: string
  contact_email: string
  contact_phone: string
  business_type: string
  trading_volume: string
  created_at: string
  updated_at: string
  wallet_address: string
  balance: number
}

export type Transaction = {
  id: string
  company_id: string
  type: string
  currency: string
  amount: number
  status: string
  tx_hash?: string
  timestamp: string
  order_id?: string
}

// Проверяем наличие переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Создаем клиент для клиентской части
let clientSupabase: ReturnType<typeof createClient> | null = null

export const getClientSupabase = () => {
  if (clientSupabase) return clientSupabase

  clientSupabase = createClient(supabaseUrl, supabaseAnonKey)

  return clientSupabase
}

// Экспортируем supabase для серверной части
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Для обратной совместимости
export const createClientComponentClient = getClientSupabase

// Mock data for companies
export const mockCompanies: Company[] = [
  {
    id: "company1",
    name: "Alpha Financials",
    registration_number: "AF12345",
    country: "us",
    address: "123 Main St, New York, NY",
    contact_name: "John Doe",
    contact_email: "john.doe@alphafinancials.com",
    contact_phone: "+15551234567",
    business_type: "Financial Institution",
    trading_volume: "medium",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    wallet_address: "0x123...",
    balance: 1000000,
  },
  {
    id: "company2",
    name: "Beta Trading Co",
    registration_number: "BT67890",
    country: "uk",
    address: "456 Oxford St, London",
    contact_name: "Jane Smith",
    contact_email: "jane.smith@betatrading.co.uk",
    contact_phone: "+442079460823",
    business_type: "Trading Company",
    trading_volume: "large",
    created_at: "2023-02-15",
    updated_at: "2023-02-15",
    wallet_address: "0x456...",
    balance: 5000000,
  },
  {
    id: "company3",
    name: "Gamma Exchange Ltd",
    registration_number: "GE24680",
    country: "sg",
    address: "789 Raffles Ave, Singapore",
    contact_name: "David Lee",
    contact_email: "david.lee@gammaexchange.sg",
    contact_phone: "+6562228888",
    business_type: "Cryptocurrency Exchange",
    trading_volume: "enterprise",
    created_at: "2023-03-01",
    updated_at: "2023-03-01",
    wallet_address: "0x789...",
    balance: 10000000,
  },
]

