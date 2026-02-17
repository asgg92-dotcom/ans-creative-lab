'use client';

import { useState, useEffect, useRef } from 'react';

export default function TerminalPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 초기 메시지 타이핑 효과
  useEffect(() => {
    const welcomeText = [
      'Welcome to LinkHub v1.0.0',
      'System initialized...',
      'Type "help" to see available commands.',
      '----------------------------------------',
    ];

    let lineIndex = 0;
    let charIndex = 0;
    const typingDelay = 50;

    const typeLine = () => {
      if (lineIndex < welcomeText.length) {
        const line = welcomeText[lineIndex];
        if (charIndex < line.length) {
          setOutput((prev) => {
            const newOutput = [...prev];
            if (newOutput[lineIndex] === undefined) {
              newOutput[lineIndex] = line[charIndex];
            } else {
              newOutput[lineIndex] += line[charIndex];
            }
            return newOutput;
          });
          charIndex++;
          setTimeout(typeLine, typingDelay);
        } else {
          lineIndex++;
          charIndex = 0;
          setTimeout(typeLine, 300); // 줄 바꿈 딜레이
        }
      } else {
        setIsTyping(false);
      }
    };

    // 초기화
    setOutput([]);
    typeLine();
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let response: string[] = [];

    switch (cleanCmd) {
      case 'help':
        response = [
          'Available commands:',
          '  help     - Show this help message',
          '  ls       - List projects',
          '  clear    - Clear terminal',
          '  whoami   - Display current user',
          '  exit     - Close session',
        ];
        break;
      case 'ls':
        response = [
          'Projects:',
          '  1. ENTROPY (Project Alpha)',
          '  2. HOLO-DECK (Project Beta)',
          '  3. ASCII TERMINAL (Project Gamma)',
        ];
        break;
      case 'whoami':
        response = ['guest@linkhub.system'];
        break;
      case 'clear':
        setOutput([]);
        return;
      case 'exit':
        window.close();
        return;
      default:
        response = [`Command not found: ${cmd}`];
    }

    setOutput((prev) => [...prev, `> ${cmd}`, ...response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-green-500 p-8 font-mono text-lg overflow-hidden flex flex-col"
      style={{ fontFamily: '"Courier New", Courier, monospace', textShadow: '0 0 5px #00ff00' }}
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
      
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
        ))}
        
        {!isTyping && (
          <div className="flex items-center mt-2">
            <span className="mr-2 text-green-500">{'>'}</span>
            <input
              id="terminal-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-green-500 font-mono caret-green-500"
              autoFocus
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
}
