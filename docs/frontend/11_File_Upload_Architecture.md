# 11 — File Upload Architecture: Drag-and-Drop & S3/Presigned URLs

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Upload Engineers, Security Architects, Frontend Engineers
- **Design System Cross-Reference**: `docs/ui-ux/19_ATS_Module_UI.md`, `docs/ui-ux/22_Assets_Module_UI.md`

---

## 1. Purpose

This document details the file upload architecture for **Awais HR**. It covers drag-and-drop dropzones, client-side MIME type validation, file chunking, upload progress indicators, and direct S3/MinIO presigned URL uploads.

---

## 2. Scope

This specification applies to all document upload interfaces (resumes in ATS, contracts in Core HR, expense receipts, and avatar photo uploads).

---

## 3. Standards & Upload Architecture

### 3.1 Upload Flow Matrix
```
┌────────────────────────────────────────────────────────────────────────┐
│ DIRECT S3 PRESIGNED UPLOAD FLOW                                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. User drops file into `FileDropzone`                                 │
│ 2. Client verifies MIME type, size limit (< 15MB) & virus hash         │
│ 3. Client calls `POST /api/v1/files/presigned-url`                     │
│ 4. Backend returns S3 Upload URL + File Storage Key                    │
│ 5. Client uploads binary directly to S3 via `PUT` with progress % bar  │
│ 6. Client submits File Key with target entity payload to backend API   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure & Upload Directory

```
src/components/
├── primitives/
│   ├── FileDropzone.tsx            # Drag-and-Drop Zone Component
│   ├── FileProgressBar.tsx         # Upload Percentage Progress Bar
│   └── FilePreviewCard.tsx         # Uploaded Document Thumbnail Card
└── hooks/
    └── useFileUpload.ts            # Presigned URL upload custom hook
```

---

## 5. Naming Conventions

- **Upload Component**: `FileDropzone.tsx`, `AvatarCropUploader.tsx`.
- **Upload Hook**: `useFileUpload.ts`.

---

## 6. Implementation Code Contracts

```typescript
// Custom File Upload Hook Contract (src/hooks/useFileUpload.ts)
import { useState } from 'react';
import axios from 'axios';
import { apiClient } from '@/services/api';

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder: string = 'documents'): Promise<string> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get Presigned URL from Backend
      const res = await apiClient.post('/files/presigned-url', {
        fileName: file.name,
        contentType: file.type,
        folder,
      });

      const { uploadUrl, fileKey } = res.data.data;

      // 2. Direct Upload to S3 Bucket
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percent);
        },
      });

      setIsUploading(false);
      return fileKey;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  return { uploadFile, progress, isUploading };
}
```

---

## 7. Best Practices

- **Validate File Types Client-Side**: Reject unauthorized extensions (`.exe`, `.sh`) immediately before requesting upload URLs.
- **Show Detailed Progress Indicators**: Display exact percentage numbers (`48% Uploaded — 1.2MB / 2.5MB`) during file transfers.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** upload binary files directly to object storage (S3) via presigned URLs to bypass application server payload bottlenecks.
- **DO** generate image thumbnails client-side using HTML5 Canvas before avatar uploads.

### Don'ts
- **DON'T** stream massive file uploads through Spring Boot backend APIs directly.
- **DON'T** display raw file storage paths to end users; convert storage keys to secure download URLs.

---

## 9. Dependencies Reference

- `react-dropzone`: Drag-and-drop file handling hooks
- `axios`: Presigned S3 HTTP binary upload driver

---

## 10. Implementation Notes

Failed uploads trigger a automatic retry option (`[ Retry Upload ]`) without forcing the user to re-select their file.
