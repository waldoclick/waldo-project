'use client';

import { useState } from 'react';
import { CustomButton } from '@/components/ui/custom-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'lucide-react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/acai.css';

interface JsonViewerButtonProps {
  data: unknown;
  title?: string;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
}

export function JsonViewerButton({
  data,
  title = 'Datos JSON',
  buttonText = 'Ver JSON',
  buttonVariant = 'outline',
  className = '',
}: JsonViewerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CustomButton
        variant={buttonVariant}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Link className="h-4 w-4 mr-2" />
        {buttonText}
      </CustomButton>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-[98vw] max-h-[95vh] overflow-hidden"
          style={{
            width: '98vw',
            maxWidth: '98vw',
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto h-[80vh]">
            <JSONPretty
              data={data}
              style={{
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
