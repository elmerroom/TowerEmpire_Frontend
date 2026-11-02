import { useState, ChangeEvent } from 'react';
import { useUpdateProfileMutation } from '@/entities/user/api/user-api';

interface AvatarUploadProps {
  currentAvatar: string | null;
}

const imageMimeType = /image\/(png|jpg|jpeg)/i;

export const AvatarUpload = ({ currentAvatar }: AvatarUploadProps) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [showUploadBtn, setShowUploadBtn] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(imageMimeType)) {
      alert('Недопустимый формат изображения (разрешены png, jpg, jpeg)');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await updateProfile(formData as any).unwrap();
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  };

  return (
    <div
      className="personal-profile__avatar position-relative"
      style={currentAvatar ? { backgroundImage: `url(${currentAvatar})` } : {}}
      onMouseEnter={() => setShowUploadBtn(true)}
      onMouseLeave={() => setShowUploadBtn(false)}
    >
      {showUploadBtn && !isLoading && (
        <label
          className="personal-profile__avatar-upload"
          htmlFor="avatar-file-input"
        >
          <span>{currentAvatar ? 'Изменить' : 'Загрузить'}</span>
        </label>
      )}
      {isLoading && (
        <div className="personal-profile__avatar-upload">
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        </div>
      )}
      <input
        type="file"
        style={{ display: 'none' }}
        id="avatar-file-input"
        accept=".png, .jpg, .jpeg"
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </div>
  );
};
