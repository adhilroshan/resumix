import { useState, useEffect } from 'react';
import { 
  TextInput, 
  Button, 
  Paper, 
  Stack, 
  Text, 
  Group, 
  Alert, 
  Box,
  ThemeIcon,
  Tooltip,
  LoadingOverlay,
  Table,
  ActionIcon,
  Badge,
  Modal,
  Textarea,
  CopyButton
} from '@mantine/core';
import { 
  IconKey, 
  IconAlertCircle,
  IconRefresh,
  IconInfoCircle,
  IconTrash,
  IconPlus,
  IconUpload,
  IconCopy
} from '@tabler/icons-react';
import { ApiKeyService } from '../services/apiKeyService';
import type { ApiKey } from '../services/apiKeyService';

interface ApiKeyManagerProps {
  onSave?: () => void;
  showValidationStatus?: boolean;
}

export function ApiKeyManager({ showValidationStatus = true }: ApiKeyManagerProps) {
  const [newApiKey, setNewApiKey] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportKeys, setBulkImportKeys] = useState('');
  
  // Load API keys on mount
  useEffect(() => {
    loadKeys();
  }, []);
  
  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.initialize();
      const allKeys = await apiKeyService.getAllKeys();
      setKeys(allKeys);
    } catch (error) {
      setErrorMessage('Failed to load API keys');
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setErrorMessage('API key cannot be empty');
      return false;
    }
    
    if (!showValidationStatus) {
      return true; // Skip validation if not required
    }
    
    setIsValidating(true);
    setErrorMessage('');
    
    try {
      // Attempt a simple validation by adding the key temporarily
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.addKey(key.trim());
      
      // Key added successfully
      await loadKeys(); // Refresh the keys list
      setNewApiKey(''); // Clear the input
      return true;
    } catch (error) {
      console.error('API key validation error:', error);
      
      if (error instanceof Error) {
        setErrorMessage(
          error.message.includes('invalid') || error.message.includes('auth') 
            ? 'Invalid API key format. Please check and try again.'
            : error.message
        );
      } else {
        setErrorMessage('Failed to add API key. Please try again.');
      }
      
      return false;
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleAddKey = async () => {
    await validateApiKey(newApiKey);
  };
  
  const handleRemoveKey = async (key: string) => {
    try {
      setIsLoading(true);
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.removeKey(key);
      await loadKeys(); // Refresh the list
    } catch (error) {
      console.error('Error removing key:', error);
      setErrorMessage('Failed to remove API key');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetKey = async (key: string) => {
    try {
      setIsLoading(true);
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.resetKey(key);
      await loadKeys(); // Refresh the list
    } catch (error) {
      console.error('Error resetting key:', error);
      setErrorMessage('Failed to reset API key');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkImport = async () => {
    try {
      setIsLoading(true);
      const keysToImport = bulkImportKeys
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (keysToImport.length === 0) {
        setErrorMessage('No valid API keys found to import');
        return;
      }
      
      const apiKeyService = ApiKeyService.getInstance();
      const addedCount = await apiKeyService.importKeys(keysToImport);
      
      setBulkImportOpen(false);
      setBulkImportKeys('');
      await loadKeys(); // Refresh the list
      
      if (addedCount > 0) {
        // Success - added some keys
        setErrorMessage(''); // Clear any error message
      } else {
        setErrorMessage('No new API keys were added (all were duplicates)');
      }
    } catch (error) {
      console.error('Error importing keys:', error);
      setErrorMessage('Failed to import API keys');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Paper p="lg" withBorder radius="md" pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ backgroundOpacity: 0.7 }} />
      
      <Stack gap="md">
        <Group justify="apart" align="center">
          <Group gap="xs">
            <ThemeIcon size="md" color="blue" variant="light">
              <IconKey size={16} />
            </ThemeIcon>
            <Text fw={500} size="md">API Key Management</Text>
          </Group>
          
          <Group>
            <Button 
              size="xs"
              variant="light"
              leftSection={<IconUpload size={14} />}
              onClick={() => setBulkImportOpen(true)}
            >
              Bulk Import
            </Button>
            <Badge color={keys.length > 0 ? "green" : "red"}>
              {keys.length} Keys
            </Badge>
          </Group>
        </Group>
        
        {errorMessage && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} onClose={() => setErrorMessage('')} withCloseButton>
            {errorMessage}
          </Alert>
        )}
        
        <Box>
          <Text size="sm" fw={500} mb="xs">Add New API Key</Text>
          <Group gap="xs">
            <TextInput
              placeholder="Enter your OpenRouter API key"
              value={newApiKey}
              onChange={(e) => {
                setNewApiKey(e.target.value);
              }}
              style={{ flex: 1 }}
              leftSection={<IconKey size={16} />}
            />
            <Button 
              onClick={handleAddKey}
              disabled={!newApiKey.trim() || isValidating}
              loading={isValidating}
              leftSection={<IconPlus size={16} />}
            >
              Add
            </Button>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            You can get API keys from{' '}
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: '#228be6' }}
            >
              OpenRouter.ai
            </a>
          </Text>
        </Box>
        
        {keys.length > 0 ? (
          <Box mt="md">
            <Text size="sm" fw={500} mb="xs">Your API Keys</Text>
            <Paper withBorder p="xs">
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Key (Masked)</th>
                    <th>Status</th>
                    <th>Usage</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((keyItem, index) => (
                    <tr key={index}>
                      <td>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>
                            {keyItem.key}
                          </Text>
                          <CopyButton value={keyItem.key} timeout={2000}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                                <ActionIcon color={copied ? "teal" : "gray"} onClick={copy} size="xs">
                                  <IconCopy size={14} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                      </td>
                      <td>
                        <Badge 
                          color={keyItem.isValid ? "green" : "red"}
                          variant="light"
                        >
                          {keyItem.isValid ? "Valid" : "Invalid"}
                        </Badge>
                      </td>
                      <td>
                        <Group gap="xs" wrap="nowrap">
                          <Badge color="blue" size="sm">
                            {keyItem.useCount} uses
                          </Badge>
                          {keyItem.errorCount > 0 && (
                            <Badge color="orange" size="sm">
                              {keyItem.errorCount} errors
                            </Badge>
                          )}
                        </Group>
                      </td>
                      <td>
                        <Text size="xs">{formatDate(keyItem.lastUsed)}</Text>
                        {keyItem.lastError && (
                          <Text size="xs" color="red">
                            Error: {keyItem.lastError}
                          </Text>
                        )}
                      </td>
                      <td>
                        <Group gap="xs" wrap="nowrap">
                          <Tooltip label="Reset Key Status">
                            <ActionIcon 
                              color="blue" 
                              onClick={() => handleResetKey(keyItem.key)}
                              size="sm"
                            >
                              <IconRefresh size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Remove Key">
                            <ActionIcon 
                              color="red" 
                              onClick={() => handleRemoveKey(keyItem.key)}
                              size="sm"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Box>
        ) : (
          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            No API keys added yet. Add at least one key to begin.
          </Alert>
        )}
      </Stack>
      
      {/* Bulk Import Modal */}
      <Modal
        opened={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        title="Bulk Import API Keys"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Enter one API key per line. These keys will be added to your collection.
          </Text>
          <Textarea
            placeholder="sk-or-xxxx1...
sk-or-xxxx2...
sk-or-xxxx3..."
            minRows={5}
            value={bulkImportKeys}
            onChange={(e) => setBulkImportKeys(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setBulkImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport}>
              Import Keys
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
} 