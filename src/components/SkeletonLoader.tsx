import { Skeleton, Box, Stack, Paper, Container, Group, Grid } from '@mantine/core';

// Card Skeleton for content that loads in card format
export function CardSkeleton({ height = 200, withTitle = true }) {
  return (
    <Paper p="md" withBorder radius="md">
      {withTitle && (
        <Group mb="md">
          <Skeleton height={28} width={200} radius="md" />
        </Group>
      )}
      <Stack>
        <Skeleton height={height} radius="md" />
      </Stack>
    </Paper>
  );
}

// List Skeleton for content displayed as lists
export function ListSkeleton({ count = 5, withHeader = true }) {
  return (
    <Stack>
      {withHeader && (
        <Skeleton height={40} width={200} radius="md" mb="md" />
      )}
      {Array(count).fill(0).map((_, i) => (
        <Skeleton key={i} height={24} radius="sm" />
      ))}
    </Stack>
  );
}

// Dashboard Skeleton for the main dashboard view
export function DashboardSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Group justify="space-between" mb="md">
          <Skeleton height={40} width={300} radius="md" />
          <Skeleton height={36} width={120} radius="md" />
        </Group>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <CardSkeleton />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <CardSkeleton />
          </Grid.Col>
        </Grid>
        
        <CardSkeleton height={300} />
      </Stack>
    </Container>
  );
}

// Form Skeleton for form elements
export function FormSkeleton({ rows = 3 }) {
  return (
    <Stack>
      {Array(rows).fill(0).map((_, i) => (
        <Box key={i}>
          <Skeleton height={24} width={120} radius="sm" mb={8} />
          <Skeleton height={36} radius="sm" />
        </Box>
      ))}
      <Skeleton height={40} width={120} radius="md" mt="md" />
    </Stack>
  );
}

// Analysis Results Skeleton
export function AnalysisSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Skeleton height={40} width={250} radius="md" mb="lg" />
        
        <CardSkeleton height={100} />
        
        <Group mt="xl" grow>
          <CardSkeleton height={180} />
          <CardSkeleton height={180} />
        </Group>
        
        <Grid mt="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ListSkeleton />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ListSkeleton />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
} 