class CreateEmployeesRequireds < ActiveRecord::Migration[5.0]
  def change
    create_table :employees_requireds do |t|
      t.integer :group_id
      t.integer :role_id
      t.datetime :start_datetime
      t.integer :required_num

      t.timestamps
    end
  end
end
