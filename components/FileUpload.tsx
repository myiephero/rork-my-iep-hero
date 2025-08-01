import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FileUp, File, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FileUploadProps {
  onFileSelected: (file: { uri: string; name: string; type: string }) => void;
  acceptedTypes?: string[];
  label?: string;
  error?: string;
  loading?: boolean;
  selectedFile?: { uri: string; name: string; type: string } | null;
  testID?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  label = 'Upload File',
  error,
  loading = false,
  selectedFile = null,
  testID
}) => {
  const [fileError, setFileError] = useState<string | null>(null);
  
  const pickDocument = async () => {
    try {
      setFileError(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const pickedFile = result.assets[0];
      
      // Create file object with required properties
      const file = {
        uri: pickedFile.uri,
        name: pickedFile.name || 'document',
        type: pickedFile.mimeType || 'application/octet-stream',
      };
      
      onFileSelected(file);
    } catch (err) {
      console.error('Error picking document:', err);
      setFileError('Failed to select file. Please try again.');
    }
  };
  
  const clearFile = () => {
    onFileSelected({ uri: '', name: '', type: '' });
  };
  
  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {!selectedFile || !selectedFile.name ? (
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickDocument}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <FileUp size={24} color={Colors.primary} />
              <Text style={styles.uploadText}>
                {Platform.OS === 'web' 
                  ? 'Click to select a file' 
                  : 'Tap to select a file'}
              </Text>
              <Text style={styles.supportedText}>
                Supported formats: PDF, DOC, DOCX
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <File size={24} color={Colors.primary} />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={clearFile}
            disabled={loading}
          >
            <X size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
      
      {(error || fileError) && (
        <Text style={styles.errorText}>{error || fileError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text,
    fontWeight: '500',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FF',
  },
  uploadText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  supportedText: {
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    marginLeft: 8,
    color: Colors.text,
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
  },
});

export default FileUpload;