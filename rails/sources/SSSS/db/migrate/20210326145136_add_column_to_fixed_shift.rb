class AddColumnToFixedShift < ActiveRecord::Migration[5.0]
  def change
    add_column :fixed_shifts, :shift_status, :integer
  end
end
