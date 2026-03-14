export class UpdateVehicleExpenseDto {
  vehicleId?: number
  date?: string
  category?: string
  categoryId?: number
  amount?: number
  currency?: string
  odometer?: number
  vendor?: string
  receiptUrl?: string
  notes?: string
}
