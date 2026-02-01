
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
  // Using a reliable QR code API for simplicity in this sandbox
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <img
        src={qrUrl}
        alt="Join Session QR Code"
        width={size}
        height={size}
        className="rounded-lg"
      />

    </div>
  );
};

export default QRCodeComponent;
