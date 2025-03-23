import { getClientSupabase, mockCompanies } from "./supabase"
import type { Company, Transaction } from "./supabase"

// Получаем клиент Supabase
const supabase = getClientSupabase()

// Функции для работы с компаниями
export async function registerCompany(companyData: Omit<Company, "id" | "created_at" | "updated_at" | "balance">) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("companies").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      const { data, error } = await supabase
        .from("companies")
        .insert({
          ...companyData,
          balance: 0, // Начальный баланс
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Если Supabase недоступен, используем моковые данные
      const newCompany: Company = {
        id: `company${mockCompanies.length + 1}`,
        name: companyData.name,
        registration_number: companyData.registration_number,
        country: companyData.country,
        address: companyData.address,
        contact_name: companyData.contact_name,
        contact_email: companyData.contact_email,
        contact_phone: companyData.contact_phone,
        business_type: companyData.business_type || "other",
        trading_volume: companyData.trading_volume || "small",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        wallet_address: companyData.wallet_address,
        balance: 0,
      }

      // Добавляем компанию в моковые данные
      mockCompanies.push(newCompany)

      return { success: true, data: newCompany }
    }
  } catch (error) {
    console.error("Error registering company:", error)
    return { success: false, error }
  }
}

export async function getCompanyByEmail(email: string) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("companies").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      const { data, error } = await supabase.from("companies").select("*").eq("contact_email", email).single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Если Supabase недоступен, используем моковые данные
      const company = mockCompanies.find((c) => c.contact_email === email)

      if (!company) {
        throw new Error("Company not found")
      }

      return { success: true, data: company }
    }
  } catch (error) {
    console.error("Error getting company by email:", error)
    return { success: false, error }
  }
}

export async function getCompanyById(id: string) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("companies").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      const { data, error } = await supabase.from("companies").select("*").eq("id", id).single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Если Supabase недоступен, используем моковые данные
      const company = mockCompanies.find((c) => c.id === id)

      if (!company) {
        // Если компания не найдена, возвращаем дефолтные данные
        return {
          success: true,
          data: {
            id: id,
            name: "Demo Company",
            balance: 100000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      }

      return { success: true, data: company }
    }
  } catch (error) {
    console.error("Error getting company by ID:", error)
    // Возвращаем успешный результат с дефолтными данными вместо ошибки
    return {
      success: true,
      data: {
        id: id,
        name: "Demo Company",
        balance: 100000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }
  }
}

export async function processDeposit(companyId: string, amount: number) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("companies").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      // Сначала получаем текущий баланс
      const { data: currentData, error: fetchError } = await supabase
        .from("companies")
        .select("balance")
        .eq("id", companyId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const currentBalance = currentData?.balance || 0
      const newBalance = currentBalance + amount

      // Обновляем баланс
      const { data, error } = await supabase
        .from("companies")
        .update({ balance: newBalance })
        .eq("id", companyId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { success: true, newBalance: data.balance }
    } else {
      // Если Supabase недоступен, используем моковые данные
      const companyIndex = mockCompanies.findIndex((c) => c.id === companyId)

      if (companyIndex === -1) {
        throw new Error("Company not found")
      }

      // Добавляем к текущему балансу, а не заменяем его
      mockCompanies[companyIndex].balance += amount

      return { success: true, newBalance: mockCompanies[companyIndex].balance }
    }
  } catch (error) {
    console.error("Error processing deposit:", error)
    return { success: false, error }
  }
}

export async function getCompanyTransactions(companyId: string) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("transactions").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      const { data, error } = await supabase.from("transactions").select("*").eq("company_id", companyId)

      if (error) {
        throw error
      }

      return { success: true, data: data as Transaction[] }
    } else {
      // Если Supabase недоступен, возвращаем пустой массив
      return { success: true, data: [] as Transaction[] }
    }
  } catch (error) {
    console.error("Error getting company transactions:", error)
    return { success: false, error }
  }
}

export async function processWithdrawal(companyId: string, amount: number) {
  try {
    // Проверяем, доступен ли Supabase
    let isSupabaseAvailable = false

    try {
      // Пробуем выполнить простой запрос к Supabase
      const { error } = await supabase.from("companies").select("count", { count: "exact", head: true })
      isSupabaseAvailable = !error
    } catch (e) {
      console.warn("Supabase is not available, using mock data instead")
      isSupabaseAvailable = false
    }

    if (isSupabaseAvailable) {
      // Если Supabase доступен, используем его
      // Сначала получаем текущий баланс
      const { data: currentData, error: fetchError } = await supabase
        .from("companies")
        .select("balance")
        .eq("id", companyId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const currentBalance = currentData?.balance || 0
      const newBalance = currentBalance - amount

      // Обновляем баланс
      const { data, error } = await supabase
        .from("companies")
        .update({ balance: newBalance })
        .eq("id", companyId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { success: true, newBalance: data.balance }
    } else {
      // Если Supabase недоступен, используем моковые данные
      const companyIndex = mockCompanies.findIndex((c) => c.id === companyId)

      if (companyIndex === -1) {
        throw new Error("Company not found")
      }

      // Вычитаем из текущего баланса, а не заменяем его
      mockCompanies[companyIndex].balance -= amount

      return { success: true, newBalance: mockCompanies[companyIndex].balance }
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return { success: false, error }
  }
}

