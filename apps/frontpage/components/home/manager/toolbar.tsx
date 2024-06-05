import {
  GridAltIcon,
  GrowIcon,
  OutlineIcon,
  RulerIcon,
  ShareAltIcon,
  SyncIcon,
  ZoomIcon,
  ZoomOutIcon,
  ZoomResetIcon,
} from '@storybook/icons';
import type { FC, ReactNode } from 'react';
import { cn } from '@repo/utils';

export const Toolbar: FC<{ slide: number }> = ({ slide }) => {
  return (
    <div
      className={cn(
        'absolute top-0 left-0 h-10 border-b border-b-[#D9E0E6] flex items-center px-2 justify-between right-0 overflow-hidden lg:right-[400px] z-10 bg-white',
        slide === 2 && 'lg:right-0',
      )}
    >
      <div className="flex mr-2">
        <ToolbarButton>
          <SyncIcon />
        </ToolbarButton>
        <ToolbarButton>
          <ZoomIcon />
        </ToolbarButton>
        <ToolbarButton>
          <ZoomOutIcon />
        </ToolbarButton>
        <ToolbarButton>
          <ZoomResetIcon />
        </ToolbarButton>
        <ToolbarButton>
          <GrowIcon />
        </ToolbarButton>
        <div className="w-px bg-[#D9E0E6] h-6 mx-2" />
        <ToolbarButton>
          <RulerIcon />
        </ToolbarButton>
        <ToolbarButton>
          <GridAltIcon />
        </ToolbarButton>
        <ToolbarButton>
          <OutlineIcon />
        </ToolbarButton>
      </div>
      <ToolbarButton>
        <ShareAltIcon />
      </ToolbarButton>
    </div>
  );
};

const ToolbarButton: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="text-[#73828C] w-7 h-7 flex items-center justify-center">
      {children}
    </div>
  );
};