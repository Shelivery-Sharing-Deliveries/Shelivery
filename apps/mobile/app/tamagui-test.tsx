import React from 'react';
import { ScrollView } from 'react-native';
import { Button } from '../components/ui/TamaguiButton';
import { styled, Text, View } from 'tamagui';

// Create some Tamagui styled components
const Container = styled(View, {
  flex: 1,
  backgroundColor: '$shelivery-background-gray',
  padding: '$4',
});

const Title = styled(Text, {
  fontSize: 24,
  fontWeight: 'bold',
  color: '$shelivery-text-primary',
  marginBottom: '$4',
});

const Card = styled(View, {
  backgroundColor: '$shelivery-card-background',
  borderRadius: '$2',
  padding: '$4',
  marginBottom: '$4',
  borderWidth: 1,
  borderColor: '$shelivery-card-border',
});

const SectionTitle = styled(Text, {
  fontSize: 18,
  fontWeight: '600',
  color: '$shelivery-text-secondary',
  marginBottom: '$3',
});

const Row = styled(View, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$3',
  marginBottom: '$4',
});

const TokenText = styled(Text, {
  marginBottom: '$2',
});

export default function TamaguiTest() {
  return (
    <Container>
      <ScrollView>
        <Title>Tamagui UI Test</Title>
        
        <Card>
          <SectionTitle>Button Variants</SectionTitle>
          <Row>
            <Button variant="primary" onPress={() => console.log('Primary pressed')}>
              Primary
            </Button>
            <Button variant="secondary" onPress={() => console.log('Secondary pressed')}>
              Secondary
            </Button>
            <Button variant="error" onPress={() => console.log('Error pressed')}>
              Error
            </Button>
            <Button variant="success" onPress={() => console.log('Success pressed')}>
              Success
            </Button>
          </Row>
        </Card>
        
        <Card>
          <SectionTitle>Button Sizes</SectionTitle>
          <Row>
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="md" variant="primary">
              Medium
            </Button>
            <Button size="lg" variant="primary">
              Large
            </Button>
          </Row>
        </Card>
        
        <Card>
          <SectionTitle>Button States</SectionTitle>
          <Row>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </Row>
        </Card>
        
        <Card>
          <SectionTitle>Design Tokens</SectionTitle>
          <TokenText color="$shelivery-text-primary">
            Primary Yellow: $shelivery-primary-yellow
          </TokenText>
          <TokenText color="$shelivery-text-secondary">
            Primary Blue: $shelivery-primary-blue
          </TokenText>
          <TokenText color="$shelivery-text-tertiary">
            Background Gray: $shelivery-background-gray
          </TokenText>
        </Card>
      </ScrollView>
    </Container>
  );
}
