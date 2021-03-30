class CreateShiftRequests < ActiveRecord::Migration[5.0]
  def change
    create_table :shift_requests do |t|
      t.integer :group_id
      t.datetime :start_datetime
      t.integer :instance_user_id

      t.timestamps
    end
  end
end
