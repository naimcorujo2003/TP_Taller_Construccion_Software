package ar.edu.siglo21.socioclub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class ClockConfig {

    // Injected wherever "today" is needed, so tests can replace it with a fixed clock
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("America/Argentina/Cordoba"));
    }
}
