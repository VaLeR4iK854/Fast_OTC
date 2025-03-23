"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { registerCompany } from "@/lib/db-service"

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    country: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    businessType: "",
    tradingVolume: "",
    acceptTerms: false,
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (
      !formData.companyName ||
      !formData.registrationNumber ||
      !formData.country ||
      !formData.address ||
      !formData.contactName ||
      !formData.contactEmail ||
      !formData.contactPhone ||
      !formData.acceptTerms
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and accept the terms.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Генерируем случайный адрес кошелька для демонстрации
      const walletAddress =
        "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

      // Регистрируем компанию в базе данных
      const result = await registerCompany({
        name: formData.companyName,
        registration_number: formData.registrationNumber,
        country: formData.country,
        address: formData.address,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        business_type: formData.businessType || "other",
        trading_volume: formData.tradingVolume || "small",
        wallet_address: walletAddress,
      })

      if (!result.success) {
        throw new Error(result.error?.message || "Registration failed")
      }

      // Сохраняем информацию о пользователе в localStorage для демонстрации
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: result.data.id,
          email: formData.contactEmail,
          companyName: formData.companyName,
        }),
      )

      // Устанавливаем начальный баланс в localStorage
      localStorage.setItem("userBalance", JSON.stringify(100000))

      // Создаем событие для оповещения других компонентов об изменении авторизации
      window.dispatchEvent(new Event("storage"))

      // Success
      toast({
        title: "Registration Submitted",
        description: "Your company registration has been submitted successfully.",
      })

      // Show confirmation modal
      setShowConfirmation(true)
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeConfirmation = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Company Registration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Company Registration</CardTitle>
          <CardDescription>Please provide your company details for registration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Enter your company's legal name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="Company registration/tax ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country of Registration *</Label>
                <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Registered Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter your company's registered address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Institution</SelectItem>
                    <SelectItem value="exchange">Cryptocurrency Exchange</SelectItem>
                    <SelectItem value="trading">Trading Company</SelectItem>
                    <SelectItem value="tech">Technology Company</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleChange("contactName", e.target.value)}
                  placeholder="Full name of company representative"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="Business email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="Business phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingVolume">Expected Monthly Trading Volume</Label>
                <Select value={formData.tradingVolume} onValueChange={(value) => handleChange("tradingVolume", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Less than $100,000</SelectItem>
                    <SelectItem value="medium">$100,000 - $1,000,000</SelectItem>
                    <SelectItem value="large">$1,000,000 - $10,000,000</SelectItem>
                    <SelectItem value="enterprise">More than $10,000,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleChange("acceptTerms", checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the Terms of Service and Privacy Policy. I confirm that all provided information is
                  accurate.
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal isOpen={showConfirmation} onClose={closeConfirmation} />
    </div>
  )
}

