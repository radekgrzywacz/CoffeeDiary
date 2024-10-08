package com.radekgrzywacz.coffeediaryapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.radekgrzywacz.coffeediaryapi.dto.RequestResponse;
import com.radekgrzywacz.coffeediaryapi.entity.Coffee;
import com.radekgrzywacz.coffeediaryapi.service.CoffeeService;

@RestController
@RequestMapping("/coffees")
public class CoffeesController {
    @Autowired
    private CoffeeService coffeeService;

    @PostMapping
    public ResponseEntity<RequestResponse> createCoffee(@RequestBody Coffee coffee) {
        return coffeeService.addCoffee(coffee);
    }

    @GetMapping
    public ResponseEntity<List<Coffee>> getCoffees() {
        return coffeeService.getCoffees();
    }
}
