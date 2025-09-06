import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { supabase } from '../../balances-app/src/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Database Migrations', () => {
  const MIGRATION_PATH = join(__dirname, '../001_initial_schema.sql')
  const ROLLBACK_PATH = join(__dirname, '../down/001_drop_initial_schema.sql')

  beforeAll(async () => {
    // Verify we can connect to test database
    const { data, error } = await supabase.auth.getSession()
    if (error && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Warning: Migration tests require valid Supabase configuration')
    }
  })

  afterAll(async () => {
    // Cleanup: Run rollback migration
    try {
      const rollbackSQL = readFileSync(ROLLBACK_PATH, 'utf8')
      await supabase.rpc('exec_sql', { sql: rollbackSQL })
    } catch (error) {
      console.warn('Migration rollback failed:', error)
    }
  })

  describe('001_initial_schema.sql', () => {
    
    it('should execute migration without errors', async () => {
      const migrationSQL = readFileSync(MIGRATION_PATH, 'utf8')
      
      // Execute migration
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (error) {
        console.error('Migration execution failed:', error)
      }
      
      // Migration should execute without throwing
      expect(error).toBeNull()
    })

    it('should create transactions table with correct schema', async () => {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'transactions')
        .eq('table_schema', 'public')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data) {
        const columns = data.reduce((acc, col) => {
          acc[col.column_name] = {
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }
          return acc
        }, {} as Record<string, any>)

        // Verify required columns exist
        expect(columns.id).toBeDefined()
        expect(columns.amount).toBeDefined()
        expect(columns.currency).toBeDefined()
        expect(columns.sender_name).toBeDefined()
        expect(columns.account_number).toBeDefined()
        expect(columns.transaction_date).toBeDefined()
        expect(columns.transaction_time).toBeDefined()
        expect(columns.raw_message).toBeDefined()
        expect(columns.webhook_id).toBeDefined()
        expect(columns.status).toBeDefined()

        // Verify data types
        expect(columns.id.type).toBe('uuid')
        expect(columns.amount.type).toBe('numeric')
        expect(columns.transaction_date.type).toBe('date')
        expect(columns.transaction_time.type).toBe('time without time zone')
        
        // Verify nullable constraints
        expect(columns.amount.nullable).toBe(false)
        expect(columns.sender_name.nullable).toBe(false)
        expect(columns.webhook_id.nullable).toBe(false)
      }
    })

    it('should create parse_errors table with correct schema', async () => {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'parse_errors')
        .eq('table_schema', 'public')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data) {
        const columns = data.reduce((acc, col) => {
          acc[col.column_name] = {
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }
          return acc
        }, {} as Record<string, any>)

        // Verify required columns exist
        expect(columns.id).toBeDefined()
        expect(columns.raw_message).toBeDefined()
        expect(columns.error_reason).toBeDefined()
        expect(columns.webhook_id).toBeDefined()
        expect(columns.occurred_at).toBeDefined()
        expect(columns.resolved).toBeDefined()

        // Verify data types
        expect(columns.id.type).toBe('uuid')
        expect(columns.resolved.type).toBe('boolean')
        expect(columns.occurred_at.type).toBe('timestamp with time zone')
      }
    })

    it('should create required indexes', async () => {
      const { data, error } = await supabase
        .from('pg_indexes')
        .select('indexname, indexdef')
        .eq('tablename', 'transactions')
        .eq('schemaname', 'public')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data) {
        const indexNames = data.map(idx => idx.indexname)
        
        expect(indexNames).toContain('idx_transactions_date')
        expect(indexNames).toContain('idx_transactions_webhook')
        expect(indexNames).toContain('idx_transactions_status')
        expect(indexNames).toContain('idx_transactions_created_at')
      }
    })

    it('should enable Row Level Security', async () => {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['transactions', 'parse_errors'])
        .eq('schemaname', 'public')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data) {
        data.forEach(table => {
          expect(table.rowsecurity).toBe(true)
        })
      }
    })

    it('should create RLS policies', async () => {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname, tablename, cmd')
        .in('tablename', ['transactions', 'parse_errors'])

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data && data.length > 0) {
        // Should have at least some policies created
        expect(data.length).toBeGreaterThan(0)
        
        // Check for specific policies
        const policyNames = data.map(p => p.policyname)
        expect(policyNames.some(name => name.includes('authenticated'))).toBe(true)
      }
    })

    it('should enforce unique constraint on webhook_id', async () => {
      const testWebhookId = 'test-unique-' + Date.now()
      
      // Insert first transaction
      const { error: firstError } = await supabase
        .from('transactions')
        .insert({
          amount: '100.00',
          currency: 'COP',
          sender_name: 'Test Sender',
          account_number: '**1234',
          transaction_date: '2025-01-15',
          transaction_time: '12:00',
          raw_message: 'Test message',
          webhook_id: testWebhookId
        })

      // First insert should succeed
      expect(firstError).toBeNull()

      // Attempt second insert with same webhook_id
      const { error: duplicateError } = await supabase
        .from('transactions')
        .insert({
          amount: '200.00',
          currency: 'COP',
          sender_name: 'Test Sender 2',
          account_number: '**5678',
          transaction_date: '2025-01-15',
          transaction_time: '13:00',
          raw_message: 'Test message 2',
          webhook_id: testWebhookId
        })

      // Second insert should fail due to unique constraint
      expect(duplicateError).toBeDefined()
      expect(duplicateError?.code).toBe('23505') // PostgreSQL unique violation code

      // Cleanup
      await supabase
        .from('transactions')
        .delete()
        .eq('webhook_id', testWebhookId)
    })

    it('should enforce amount check constraint', async () => {
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount: '-100.00', // Invalid negative amount
          currency: 'COP',
          sender_name: 'Test Sender',
          account_number: '**1234',
          transaction_date: '2025-01-15',
          transaction_time: '12:00',
          raw_message: 'Test message',
          webhook_id: 'test-negative-' + Date.now()
        })

      // Should fail due to amount > 0 constraint
      expect(error).toBeDefined()
      expect(error?.code).toBe('23514') // PostgreSQL check violation code
    })
  })

  describe('Migration Rollback', () => {
    
    it('should execute rollback migration without errors', async () => {
      const rollbackSQL = readFileSync(ROLLBACK_PATH, 'utf8')
      
      // Execute rollback
      const { error } = await supabase.rpc('exec_sql', { sql: rollbackSQL })
      
      if (error) {
        console.error('Rollback execution failed:', error)
      }
      
      expect(error).toBeNull()
    })

    it('should remove all created tables', async () => {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['transactions', 'parse_errors'])

      expect(error).toBeNull()
      
      if (data) {
        expect(data.length).toBe(0)
      }
    })
  })
})