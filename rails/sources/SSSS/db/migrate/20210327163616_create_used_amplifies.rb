class CreateUsedAmplifies < ActiveRecord::Migration[5.0]
  def change
    create_table :used_amplifies do |t|
      t.integer :is_used
      t.integer :group_id

      t.timestamps
    end
  end
end
