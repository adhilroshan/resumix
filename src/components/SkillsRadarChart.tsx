import { 
  Box, 
  rem,
  Group,
  Badge,
  Tooltip,
  useMantineTheme
} from '@mantine/core';

// Radar Chart Component
export const SkillsRadarChart = ({ skills, missingSkills }: { skills: string[]; missingSkills: string[] }) => {
  const theme = useMantineTheme();
  const isMobile = theme.breakpoints.sm;
  
  // This is a simplified radar chart using CSS
  const allSkills = [...skills, ...missingSkills].slice(0, 8); // Limit to 8 skills for visualization
  const angle = (2 * Math.PI) / allSkills.length;
  
  // Adjust chart size for mobile
  const chartSize = isMobile ? 250 : 300;
  const outerRadius = isMobile ? 180 : 220;
  const middleRadius = isMobile ? 130 : 160;
  const innerRadius = isMobile ? 80 : 100;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  
  return (
    <Box style={{ position: 'relative', width: '100%', height: rem(chartSize) }}>
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: rem(outerRadius),
        height: rem(outerRadius),
        border: '1px solid #eaeaea',
        borderRadius: '50%',
        opacity: 0.3
      }} />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: rem(middleRadius),
        height: rem(middleRadius),
        border: '1px solid #eaeaea',
        borderRadius: '50%',
        opacity: 0.3
      }} />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: rem(innerRadius),
        height: rem(innerRadius),
        border: '1px solid #eaeaea',
        borderRadius: '50%',
        opacity: 0.3
      }} />
      
      {allSkills.map((skill, i) => {
        const isPresent = !missingSkills.includes(skill);
        // Adjust skill bubble size and position for mobile
        const radius = isPresent 
          ? (isMobile ? chartSize * 0.35 : chartSize * 0.37) 
          : (isMobile ? chartSize * 0.23 : chartSize * 0.23);
        
        const x = centerX + radius * Math.cos(i * angle - Math.PI/2);
        const y = centerY + radius * Math.sin(i * angle - Math.PI/2);
        
        return (
          <Tooltip key={i} label={skill} position="top" withinPortal>
            <div style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              background: isPresent ? '#4dabf7' : '#ff6b6b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: rem(4),
              fontSize: rem(isMobile ? 10 : 12),
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxWidth: rem(isMobile ? 80 : 100),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: 0,
              animation: `fadeIn 0.5s ease-in-out ${0.1 * i}s forwards`
            }}>
              {skill.length > (isMobile ? 8 : 12) ? skill.substring(0, (isMobile ? 6 : 10)) + '...' : skill}
            </div>
          </Tooltip>
        );
      })}
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: rem(8),
        background: 'rgba(255,255,255,0.8)',
        borderRadius: rem(4),
        fontSize: rem(12)
      }}>
        <Group gap="xs">
          <Badge size="xs" color="blue">Your Skills</Badge>
          <Badge size="xs" color="red">Missing Skills</Badge>
        </Group>
      </div>
    </Box>
  );
}; 